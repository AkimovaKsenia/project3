use axum::extract::{Query, State};
use axum::{Json, http::StatusCode};
use chrono::{DateTime, Utc};
use serde_json::Value;
use serde::Deserialize;
use sqlx::Row;

use crate::app_state::AppState;
use crate::services::osdr_service::fetch_and_store_osdr;


#[derive(Deserialize)]
pub struct OsdrQuery {
    #[serde(default = "default_limit")]
    limit: i64,
    #[serde(default)]
    sort_by: String,  
    #[serde(default)]
    order: String,   
}

fn default_limit() -> i64 { 20 }

pub async fn osdr_sync(State(st): State<AppState>) -> Result<Json<Value>, (StatusCode, String)> {
    let written = fetch_and_store_osdr(&st).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok(Json(serde_json::json!({ "written": written })))
}



pub async fn osdr_list(
    State(st): State<AppState>,
    Query(query): Query<OsdrQuery>,  
) -> Result<Json<Value>, (StatusCode, String)> {
    
    let valid_sort_columns = ["id", "dataset_id", "title", "status", "updated_at", "inserted_at"];
    let sort_by = if valid_sort_columns.contains(&query.sort_by.as_str()) {
        query.sort_by.clone()
    } else {
        "inserted_at".to_string()
    };

    let order = if query.order.to_lowercase() == "asc" {
        "ASC"
    } else {
        "DESC"
    };

    // ИЗМЕНИТЬ SQL ЗАПРОС - ДОБАВИТЬ СОРТИРОВКУ
    let query_str = format!(
        "SELECT id, dataset_id, title, status, updated_at, inserted_at, raw
         FROM osdr_items
         ORDER BY {} {}
         LIMIT $1",
        sort_by, order
    );

    let rows = sqlx::query(&query_str)  // ИЗМЕНИТЬ ЭТУ СТРОКУ
        .bind(query.limit)  // ИСПОЛЬЗОВАТЬ limit ИЗ ЗАПРОСА
        .fetch_all(&st.pool).await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let out: Vec<Value> = rows.into_iter().map(|r| {
        serde_json::json!({
            "id": r.get::<i64,_>("id"),
            "dataset_id": r.get::<Option<String>,_>("dataset_id"),
            "title": r.get::<Option<String>,_>("title"),
            "status": r.get::<Option<String>,_>("status"),
            "updated_at": r.get::<Option<DateTime<Utc>>,_>("updated_at"),
            "inserted_at": r.get::<DateTime<Utc>, _>("inserted_at"),
            "raw": r.get::<Value,_>("raw"),
        })
    }).collect();

    Ok(Json(serde_json::json!({ "items": out })))
}