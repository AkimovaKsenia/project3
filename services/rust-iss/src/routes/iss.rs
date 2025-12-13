use axum::extract::State;
use axum::{Json, http::StatusCode};
use chrono::{DateTime, Utc};
use serde::Serialize;
use serde_json::Value;
use sqlx::Row;

use crate::app_state::AppState;
use crate::services::iss_service::fetch_and_store_iss;

pub async fn last_iss(State(st): State<AppState>) -> Result<Json<Value>, (StatusCode, String)> {
    let row_opt = sqlx::query(
        "SELECT id, fetched_at, source_url, payload
         FROM iss_fetch_log
         ORDER BY id DESC LIMIT 1"
    ).fetch_optional(&st.pool).await
     .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if let Some(row) = row_opt {
        let id: i64 = row.get("id");
        let fetched_at: DateTime<Utc> = row.get::<DateTime<Utc>, _>("fetched_at");
        let source_url: String = row.get("source_url");
        let payload: Value = row.try_get("payload").unwrap_or(serde_json::json!({}));
        return Ok(Json(serde_json::json!({
            "id": id, "fetched_at": fetched_at, "source_url": source_url, "payload": payload
        })));
    }
    Ok(Json(serde_json::json!({"message":"no data"})))
}

pub async fn trigger_iss(State(st): State<AppState>) -> Result<Json<Value>, (StatusCode, String)> {
    fetch_and_store_iss(&st.pool, &st.fallback_url).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    last_iss(State(st)).await
}

#[derive(Serialize)]
pub struct Trend {
    movement: bool,
    delta_km: f64,
    dt_sec: f64,
    velocity_kmh: Option<f64>,
    from_time: Option<DateTime<Utc>>,
    to_time: Option<DateTime<Utc>>,
    from_lat: Option<f64>,
    from_lon: Option<f64>,
    to_lat: Option<f64>,
    to_lon: Option<f64>,
}

pub async fn iss_trend(State(st): State<AppState>) -> Result<Json<Trend>, (StatusCode, String)> {
    let rows = sqlx::query("SELECT fetched_at, payload FROM iss_fetch_log ORDER BY id DESC LIMIT 2")
        .fetch_all(&st.pool).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    if rows.len() < 2 {
        return Ok(Json(Trend {
            movement: false, delta_km: 0.0, dt_sec: 0.0, velocity_kmh: None,
            from_time: None, to_time: None,
            from_lat: None, from_lon: None, to_lat: None, to_lon: None
        }));
    }

    let t2: DateTime<Utc> = rows[0].get("fetched_at");
    let t1: DateTime<Utc> = rows[1].get("fetched_at");
    let p2: Value = rows[0].get("payload");
    let p1: Value = rows[1].get("payload");

    let lat1 = num(&p1["latitude"]);
    let lon1 = num(&p1["longitude"]);
    let lat2 = num(&p2["latitude"]);
    let lon2 = num(&p2["longitude"]);
    let v2 = num(&p2["velocity"]);

    let mut delta_km = 0.0;
    let mut movement = false;
    if let (Some(a1), Some(o1), Some(a2), Some(o2)) = (lat1, lon1, lat2, lon2) {
        delta_km = haversine_km(a1, o1, a2, o2);
        movement = delta_km > 0.1;
    }
    let dt_sec = (t2 - t1).num_milliseconds() as f64 / 1000.0;

    Ok(Json(Trend {
        movement,
        delta_km,
        dt_sec,
        velocity_kmh: v2,
        from_time: Some(t1),
        to_time: Some(t2),
        from_lat: lat1, from_lon: lon1, to_lat: lat2, to_lon: lon2,
    }))
}

fn num(v: &Value) -> Option<f64> {
    if let Some(x) = v.as_f64() { return Some(x); }
    if let Some(s) = v.as_str() { return s.parse::<f64>().ok(); }
    None
}

fn haversine_km(lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
    let rlat1 = lat1.to_radians();
    let rlat2 = lat2.to_radians();
    let dlat = (lat2 - lat1).to_radians();
    let dlon = (lon2 - lon1).to_radians();
    let a = (dlat / 2.0).sin().powi(2) + rlat1.cos() * rlat2.cos() * (dlon / 2.0).sin().powi(2);
    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
    6371.0 * c
}