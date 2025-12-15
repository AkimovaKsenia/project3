use std::time::Duration;
use chrono::Utc;
use reqwest;
use serde_json::Value;

use crate::app_state::AppState;

async fn write_cache(pool: &sqlx::PgPool, source: &str, payload: Value) -> anyhow::Result<()> {
    sqlx::query("INSERT INTO space_cache(source, payload) VALUES ($1,$2)")
        .bind(source).bind(payload).execute(pool).await?;
    Ok(())
}

fn last_days(n: i64) -> (String,String) {
    let to = Utc::now().date_naive();
    let from = to - chrono::Days::new(n as u64);
    (from.to_string(), to.to_string())
}


pub async fn fetch_apod(st: &AppState) -> anyhow::Result<()> {
    let url = "https://api.nasa.gov/planetary/apod";

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    let mut req = client
        .get(url)
        .query(&[("thumbs", "true")]);

    if !st.nasa_key.is_empty() {
        req = req.query(&[("api_key", &st.nasa_key)]);
    }

    let resp = req.send().await?;
    let status = resp.status();
    let text = resp.text().await?;

    if !status.is_success() {
        tracing::error!("APOD HTTP {} body={}", status, text);
        anyhow::bail!("APOD request failed: {}", status);
    }

    let json: Value = serde_json::from_str(&text)
        .map_err(|e| {
            tracing::error!("APOD invalid json body={}", text);
            e
        })?;

    write_cache(&st.pool, "apod", json).await
}





pub async fn fetch_neo_feed(st: &AppState) -> anyhow::Result<()> {
    let today = Utc::now().date_naive();
    let start = today - chrono::Days::new(2);
    let url = "https://api.nasa.gov/neo/rest/v1/feed";
    
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    let mut req = client.get(url).query(&[
        ("start_date", start.to_string()),
        ("end_date", today.to_string()),
    ]);
    
    if !st.nasa_key.is_empty() { 
        req = req.query(&[("api_key",&st.nasa_key)]);
        tracing::info!("NEO: using NASA API key");
    } else {
        tracing::warn!("NEO: no NASA API key provided");
    }

    let resp = req.send().await?;
    let status = resp.status();
    let text = resp.text().await?;

    if !status.is_success() {
        tracing::error!("NEO HTTP {} body={}", status, &text[..text.len().min(500)]);
        anyhow::bail!("NEO request failed: {}", status);
    }

    match serde_json::from_str::<Value>(&text) {
        Ok(json) => {
            tracing::info!("NEO: successfully fetched");
            write_cache(&st.pool, "neo", json).await
        },
        Err(e) => {
            tracing::error!("NEO invalid json: {}, body={}", e, &text[..text.len().min(500)]);
            Err(e.into())
        }
    }
}


pub async fn fetch_donki(st: &AppState) -> anyhow::Result<()> {
    let _ = fetch_donki_flr(st).await;
    let _ = fetch_donki_cme(st).await;
    Ok(())
}


pub async fn fetch_donki_flr(st: &AppState) -> anyhow::Result<()> {
    let (from,to) = last_days(5);
    let url = "https://api.nasa.gov/DONKI/FLR";
    
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    let mut req = client.get(url).query(&[("startDate",from),("endDate",to)]);
    if !st.nasa_key.is_empty() { 
        req = req.query(&[("api_key",&st.nasa_key)]);
        tracing::info!("DONKI FLR: using NASA API key");
    } else {
        tracing::warn!("DONKI FLR: no NASA API key provided");
    }

    let resp = req.send().await?;
    let status = resp.status();
    let text = resp.text().await?;

    if !status.is_success() {
        tracing::error!("DONKI FLR HTTP {} body={}", status, &text[..text.len().min(500)]);
        anyhow::bail!("DONKI FLR request failed: {}", status);
    }

    match serde_json::from_str::<Value>(&text) {
        Ok(json) => {
            tracing::info!("DONKI FLR: successfully fetched");
            write_cache(&st.pool, "flr", json).await
        },
        Err(e) => {
            tracing::error!("DONKI FLR invalid json: {}, body={}", e, &text[..text.len().min(500)]);
            Err(e.into())
        }
    }
}


pub async fn fetch_donki_cme(st: &AppState) -> anyhow::Result<()> {
    let (from,to) = last_days(5);
    let url = "https://api.nasa.gov/DONKI/CME";
    
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    let mut req = client.get(url).query(&[("startDate",from),("endDate",to)]);
    if !st.nasa_key.is_empty() { 
        req = req.query(&[("api_key",&st.nasa_key)]);
        tracing::info!("DONKI CME: using NASA API key");
    } else {
        tracing::warn!("DONKI CME: no NASA API key provided");
    }

    let resp = req.send().await?;
    let status = resp.status();
    let text = resp.text().await?;

    if !status.is_success() {
        tracing::error!("DONKI CME HTTP {} body={}", status, &text[..text.len().min(500)]);
        anyhow::bail!("DONKI CME request failed: {}", status);
    }

    match serde_json::from_str::<Value>(&text) {
        Ok(json) => {
            tracing::info!("DONKI CME: successfully fetched");
            write_cache(&st.pool, "cme", json).await
        },
        Err(e) => {
            tracing::error!("DONKI CME invalid json: {}, body={}", e, &text[..text.len().min(500)]);
            Err(e.into())
        }
    }
}


pub async fn fetch_spacex_next(st: &AppState) -> anyhow::Result<()> {
    let url = "https://api.spacexdata.com/v4/launches/next";
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .build()?;

    tracing::info!("SpaceX: fetching data");
    let resp = client.get(url).send().await?;
    let status = resp.status();
    let text = resp.text().await?;

    if !status.is_success() {
        tracing::error!("SpaceX HTTP {} body={}", status, &text[..text.len().min(500)]);
        anyhow::bail!("SpaceX request failed: {}", status);
    }

    match serde_json::from_str::<Value>(&text) {
        Ok(json) => {
            tracing::info!("SpaceX: successfully fetched");
            write_cache(&st.pool, "spacex", json).await
        },
        Err(e) => {
            tracing::error!("SpaceX invalid json: {}, body={}", e, &text[..text.len().min(500)]);
            Err(e.into())
        }
    }
}