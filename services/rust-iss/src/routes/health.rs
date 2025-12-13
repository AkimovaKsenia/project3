use axum::Json;
use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Serialize)]
pub struct Health { 
    status: &'static str, 
    now: DateTime<Utc> 
}

pub async fn health() -> Json<Health> {
    Json(Health { status: "ok", now: Utc::now() })
}