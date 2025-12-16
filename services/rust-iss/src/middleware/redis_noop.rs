

use axum::{
    extract::State,
    middleware::Next,
    response::Response,
};
use axum::http::{Request, StatusCode};
use crate::app_state::AppState;
use deadpool_redis::redis::AsyncCommands;

pub async fn redis_noop(
    State(st): State<AppState>,
    req: Request<axum::body::Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let pool = st.redis.clone();

    
    tokio::spawn(async move {
        if let Ok(mut conn) = pool.get().await {
            let key = "rl:global";

            
            let _ : Result<i64, _> = conn.incr(key, 1).await;
            let _ : Result<(), _> = conn.expire(key, 60).await;
           
        }
    });

    
    Ok(next.run(req).await)
}
