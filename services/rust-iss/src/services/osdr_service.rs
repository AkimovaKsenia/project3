use std::time::Duration;
use chrono::{DateTime, NaiveDateTime, TimeZone, Utc};
use reqwest;
use serde_json::Value;
use sqlx::{PgPool, Row}; 

use crate::app_state::AppState;
use crate::utils::helpers::{s_pick, t_pick};



pub async fn fetch_and_store_osdr(st: &AppState) -> anyhow::Result<usize> {
    let client = reqwest::Client::builder().timeout(Duration::from_secs(30)).build()?;
    let resp = client.get(&st.nasa_url).send().await?;
    
    if !resp.status().is_success() {
        anyhow::bail!("OSDR request status {}", resp.status());
    }
    
    let json: Value = resp.json().await?;
    let mut written = 0usize;
    
    
    sqlx::query("DELETE FROM osdr_items").execute(&st.pool).await?;
    
    
    if let Some(obj) = json.as_object() {
        for (dataset_id, item_data) in obj {
           
            let raw_value = if item_data.is_string() {
                
                let mut raw_obj = serde_json::Map::new();
                raw_obj.insert("REST_URL".to_string(), item_data.clone());
                Value::Object(raw_obj)
            } else if item_data.is_object() {
                
                item_data.clone()
            } else {
                
                item_data.clone()
            };
            
            sqlx::query(
                "INSERT INTO osdr_items(dataset_id, title, status, raw)
                 VALUES($1,$2,$3,$4)"
            )
            .bind(dataset_id)
            .bind::<Option<String>>(None)  // title
            .bind::<Option<String>>(None)  // status
            .bind(raw_value)
            .execute(&st.pool).await?;
            
            written += 1;
        }
    } else {
        tracing::warn!("OSDR API returned unexpected format");
    }
    
    tracing::info!("OSDR: processed {} items", written);
    Ok(written)
}