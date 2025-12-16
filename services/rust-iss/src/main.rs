


use std::time::Duration;
use axum::{Router, routing::get};
use tracing_subscriber::{EnvFilter, FmtSubscriber};

use middleware::redis_noop::redis_noop;
use axum::middleware::from_fn_with_state;
use deadpool_redis::Pool;


mod app_state;
mod db;
mod routes;
mod services;
mod utils;
mod middleware;

use app_state::AppState;
use db::init_db;
use services::iss_service::fetch_and_store_iss;
use services::osdr_service::fetch_and_store_osdr;
use services::space_cache_service::{
    fetch_apod, fetch_neo_feed, fetch_donki_flr, fetch_donki_cme, fetch_spacex_next
};




#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let redis_url = std::env::var("REDIS_URL")
    .unwrap_or_else(|_| "redis://redis:6379".to_string());

    let redis_cfg = deadpool_redis::Config::from_url(redis_url);
    let redis_pool: Pool = redis_cfg
    .create_pool(Some(deadpool_redis::Runtime::Tokio1))
    .expect("cannot create redis pool");
    let subscriber = FmtSubscriber::builder()
        .with_env_filter(EnvFilter::from_default_env())
        .finish();
    let _ = tracing::subscriber::set_global_default(subscriber);

    dotenvy::dotenv().ok();

    let db_url = std::env::var("DATABASE_URL").expect("DATABASE_URL is required");

    let nasa_url = std::env::var("NASA_API_URL")
        .unwrap_or_else(|_| "https://visualization.osdr.nasa.gov/biodata/api/v2/datasets/?format=json".to_string());
    let nasa_key = std::env::var("NASA_API_KEY").unwrap_or_default();

    let fallback_url = std::env::var("WHERE_ISS_URL")
        .unwrap_or_else(|_| "https://api.wheretheiss.at/v1/satellites/25544".to_string());

    let every_osdr   = env_u64("FETCH_EVERY_SECONDS", 600);
    let every_iss    = env_u64("ISS_EVERY_SECONDS",   120);
    let every_apod   = env_u64("APOD_EVERY_SECONDS",  43200); // 12ч
    let every_neo    = env_u64("NEO_EVERY_SECONDS",   7200);  // 2ч
    let every_donki  = env_u64("DONKI_EVERY_SECONDS", 3600);  // 1ч
    let every_spacex = env_u64("SPACEX_EVERY_SECONDS",3600);

    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;
    init_db(&pool).await?;

    let state = AppState {
        pool: pool.clone(),
        redis: redis_pool,
        nasa_url: nasa_url.clone(),
        nasa_key,
        fallback_url: fallback_url.clone(),
        every_osdr, every_iss, every_apod, every_neo, every_donki, every_spacex,
    };

    // фон OSDR
    {
        let st = state.clone();
        tokio::spawn(async move {
            loop {
                if let Err(e) = fetch_and_store_osdr(&st).await { 
                    tracing::error!("osdr err {e:?}") 
                }
                tokio::time::sleep(Duration::from_secs(st.every_osdr)).await;
            }
        });
    }
    // фон ISS
    {
        let st = state.clone();
        tokio::spawn(async move {
            loop {
                if let Err(e) = fetch_and_store_iss(&st.pool, &st.fallback_url).await { 
                    tracing::error!("iss err {e:?}") 
                }
                tokio::time::sleep(Duration::from_secs(st.every_iss)).await;
            }
        });
    }
    // фон APOD
    {
        let st = state.clone();
        tokio::spawn(async move {
            loop {
                if let Err(e) = fetch_apod(&st).await { 
                    tracing::error!("apod err {e:?}") 
                }
                tokio::time::sleep(Duration::from_secs(st.every_apod)).await;
            }
        });
    }
    // фон NeoWs
    {
        let st = state.clone();
        tokio::spawn(async move {
            loop {
                if let Err(e) = fetch_neo_feed(&st).await { 
                    tracing::error!("neo err {e:?}") 
                }
                tokio::time::sleep(Duration::from_secs(st.every_neo)).await;
            }
        });
    }
    // фон DONKI
    {
    let st = state.clone();
    tokio::spawn(async move {
        loop {
            if let Err(e) = fetch_donki_flr(&st).await { 
                tracing::error!("donki flr err {e:?}") 
            }
            if let Err(e) = fetch_donki_cme(&st).await { 
                tracing::error!("donki cme err {e:?}") 
            }
            tokio::time::sleep(Duration::from_secs(st.every_donki)).await;
        }
    });
    }
    // фон SpaceX
    {
        let st = state.clone();
        tokio::spawn(async move {
            loop {
                if let Err(e) = fetch_spacex_next(&st).await { 
                    tracing::error!("spacex err {e:?}") 
                }
                tokio::time::sleep(Duration::from_secs(st.every_spacex)).await;
            }
        });
    }

    
    
    let api_routes = Router::new()
    // ISS
    .route("/last", get(routes::iss::last_iss))
    .route("/fetch", get(routes::iss::trigger_iss))
    .route("/iss/trend", get(routes::iss::iss_trend))
    // OSDR
    .route("/osdr/sync", get(routes::osdr::osdr_sync))
    .route("/osdr/list", get(routes::osdr::osdr_list))
    // Space cache
    .route("/space/:src/latest", get(routes::space_cache::space_latest))
    .route("/space/refresh", get(routes::space_cache::space_refresh))
    .route("/space/summary", get(routes::space_cache::space_summary))
    // .layer(from_fn_with_state(state.clone(), rate_limit))
    .layer(from_fn_with_state(state.clone(), redis_noop))
    .with_state(state.clone());

    let app = Router::new()
        .route("/health", get(routes::health::health)) 
        .merge(api_routes);                           


    let listener = tokio::net::TcpListener::bind(("0.0.0.0", 3000)).await?;
    tracing::info!("rust_iss listening on 0.0.0.0:3000");
    axum::serve(listener, app.into_make_service()).await?;
    Ok(())
}

fn env_u64(k: &str, d: u64) -> u64 {
    std::env::var(k).ok().and_then(|s| s.parse().ok()).unwrap_or(d)
}