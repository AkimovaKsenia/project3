use axum::{
    extract::State,
    http::Request,
    middleware::Next,
    response::Response,
    http::StatusCode,
};
use deadpool_redis::{Pool, Connection};
use deadpool_redis::redis::AsyncCommands; 
use crate::app_state::AppState;

pub async fn rate_limit(
    State(st): State<AppState>,
    
    req: axum::http::Request<axum::body::Body>,
    next: Next,
) -> Result<Response, StatusCode> {
    let key = "rl:global";

    let mut conn: Connection = st.redis.get().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let count: i64 = conn.incr(&key, 1).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    if count == 1 {
        let _: () = conn.expire(&key, 60).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    if count > 60 {
        return Err(StatusCode::TOO_MANY_REQUESTS);
    }

    Ok(next.run(req).await)
}
