use sqlx::PgPool;
use deadpool_redis::Pool; 

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub redis: Pool, 
    pub nasa_url: String,          // OSDR
    pub nasa_key: String,          // ключ NASA
    pub fallback_url: String,      // ISS 
    pub every_osdr: u64,
    pub every_iss: u64,
    pub every_apod: u64,
    pub every_neo: u64,
    pub every_donki: u64,
    pub every_spacex: u64,
}