// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rusqlite::{Connection, Result as SqliteResult, params};
use serde::{Serialize, Deserialize};
use chrono::{DateTime, Utc};
use uuid::Uuid;
use directories::ProjectDirs;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct Post {
    id: String,
    content: String,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    is_synced: bool,
}

fn get_db_path() -> PathBuf {
    let proj_dirs = ProjectDirs::from("com", "hitori", "app")
        .expect("Could not determine project directories");
    
    let data_dir = proj_dirs.data_dir();
    
    // データディレクトリが存在しない場合は作成
    if !data_dir.exists() {
        fs::create_dir_all(data_dir).expect("Failed to create data directory");
    }
    
    data_dir.join("hitori.db")
}

fn init_db() -> SqliteResult<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(db_path)?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            is_synced INTEGER NOT NULL
        )",
        [],
    )?;
    
    Ok(conn)
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_posts() -> Result<Vec<Post>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare("SELECT id, content, created_at, updated_at, is_synced FROM posts ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    
    let post_iter = stmt.query_map([], |row| {
        let is_synced: i32 = row.get(4)?;
        let created_at_str: String = row.get(2)?;
        let updated_at_str: String = row.get(3)?;
        let created_at = DateTime::parse_from_rfc3339(&created_at_str)
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e)))?
            .with_timezone(&Utc);
        let updated_at = DateTime::parse_from_rfc3339(&updated_at_str)
            .map_err(|e| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(e)))?
            .with_timezone(&Utc);

        Ok(Post {
            id: row.get(0)?,
            content: row.get(1)?,
            created_at,
            updated_at,
            is_synced: is_synced != 0,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut posts = Vec::new();
    for post in post_iter {
        posts.push(post.map_err(|e| e.to_string())?);
    }
    
    Ok(posts)
}

#[tauri::command]
fn add_post(content: String) -> Result<Post, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    
    let now = Utc::now();
    let id = Uuid::new_v4().to_string();
    
    let new_post = Post {
        id: id.clone(),
        content: content.clone(),
        created_at: now,
        updated_at: now,
        is_synced: false,
    };
    
    conn.execute(
        "INSERT INTO posts (id, content, created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?)",
        params![
            new_post.id,
            new_post.content,
            new_post.created_at,
            new_post.updated_at,
            new_post.is_synced as i32
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(new_post)
}

#[tauri::command]
fn delete_post(id: String) -> Result<(), String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    
    conn.execute(
        "DELETE FROM posts WHERE id = ?",
        params![id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
fn update_sync_status(ids: Vec<String>, is_synced: bool) -> Result<(), String> {
    let mut conn = init_db().map_err(|e| e.to_string())?;
    
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    
    for id in ids {
        tx.execute(
            "UPDATE posts SET is_synced = ? WHERE id = ?",
            params![is_synced as i32, id],
        ).map_err(|e| e.to_string())?;
    }
    
    tx.commit().map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_posts,
            add_post,
            delete_post,
            update_sync_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

