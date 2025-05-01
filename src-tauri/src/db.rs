use rusqlite::{Connection, Result as SqliteResult, params};
use directories::ProjectDirs;
use std::fs;
use std::path::PathBuf;
use chrono::Utc;
use uuid::Uuid;

use crate::models::Post;

/// データベースファイルのパスを取得する
pub fn get_db_path() -> PathBuf {
    let proj_dirs = ProjectDirs::from("com", "hitori", "app")
        .expect("Could not determine project directories");
    
    let data_dir = proj_dirs.data_dir();
    
    // データディレクトリが存在しない場合は作成
    if !data_dir.exists() {
        fs::create_dir_all(data_dir).expect("Failed to create data directory");
    }
    
    data_dir.join("hitori.db")
}

/// データベース接続を初期化する
pub fn init_db() -> SqliteResult<Connection> {
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

/// テスト用にデータベースを初期化する
#[cfg(test)]
pub fn init_db_for_test(conn: &Connection) -> SqliteResult<()> {
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
    
    Ok(())
}

/// 投稿を取得する
pub fn get_posts() -> Result<Vec<Post>, String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    get_posts_from_db(&conn)
}

/// データベースから投稿を取得する
pub fn get_posts_from_db(conn: &Connection) -> Result<Vec<Post>, String> {
    let mut stmt = conn.prepare("SELECT id, content, created_at, updated_at, is_synced FROM posts ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;
    
    let post_iter = stmt.query_map([], |row| {
        let is_synced: i32 = row.get(4)?;
        
        Ok(Post {
            id: row.get(0)?,
            content: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            is_synced: is_synced != 0,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut posts = Vec::new();
    for post in post_iter {
        posts.push(post.map_err(|e| e.to_string())?);
    }
    
    Ok(posts)
}

/// 投稿を追加する
pub fn add_post(content: String) -> Result<Post, String> {
    let conn = init_db().map_err(|e| e.to_string())?;

    let now = Utc::now().to_rfc3339();
    let id = Uuid::new_v4().to_string();
    
    let new_post = Post {
        id: id.clone(),
        content: content.clone(),
        created_at: now.clone(),
        updated_at: now.clone(),
        is_synced: false,
    };
    
    add_post_to_db(&conn, &new_post)?;
    
    Ok(new_post)
}

/// データベースに投稿を追加する
pub fn add_post_to_db(conn: &Connection, post: &Post) -> Result<(), String> {
    conn.execute(
        "INSERT INTO posts (id, content, created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?)",
        params![
            post.id,
            post.content,
            post.created_at,
            post.updated_at,
            post.is_synced as i32
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// 投稿を削除する
pub fn delete_post(id: String) -> Result<(), String> {
    let conn = init_db().map_err(|e| e.to_string())?;
    delete_post_from_db(&conn, &id)
}

/// データベースから投稿を削除する
pub fn delete_post_from_db(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute(
        "DELETE FROM posts WHERE id = ?",
        params![id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// 同期状態を更新する
pub fn update_sync_status(ids: Vec<String>, is_synced: bool) -> Result<(), String> {
    let mut conn = init_db().map_err(|e| e.to_string())?; // Make conn mutable
    update_sync_status_in_db(&mut conn, &ids, is_synced) // Pass mutable reference
}

/// データベースで同期状態を更新する
pub fn update_sync_status_in_db(conn: &mut Connection, ids: &[String], is_synced: bool) -> Result<(), String> { // Accept mutable reference
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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;
    use uuid::Uuid;

    #[test]
    fn test_crud_operations() {
        // テスト用にインメモリデータベースを使用
        let mut conn = Connection::open_in_memory().unwrap(); // Make conn mutable
        init_db_for_test(&conn).unwrap();

        // 投稿を追加
        let content = "テスト投稿です";
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();
        
        let post = Post {
            id: id.clone(),
            content: content.to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        add_post_to_db(&conn, &post).unwrap();
        
        // 投稿を取得して確認
        let posts = get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 1);
        assert_eq!(posts[0].id, id);
        assert_eq!(posts[0].content, content);
        assert_eq!(posts[0].is_synced, false);

        // 同期状態を更新
        update_sync_status_in_db(&mut conn, &[id.clone()], true).unwrap(); // Pass mutable reference

        // 更新後の状態を確認
        let posts = get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 1);
        assert_eq!(posts[0].is_synced, true);
        
        // 投稿を削除
        delete_post_from_db(&conn, &id).unwrap();
        
        // 削除後に投稿がないことを確認
        let posts = get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 0);
    }
    
    #[test]
    fn test_multiple_posts() {
        // テスト用にインメモリデータベースを使用
        let mut conn = Connection::open_in_memory().unwrap(); // Make conn mutable
        init_db_for_test(&conn).unwrap();

        // テスト用の投稿を複数追加
        let now = Utc::now().to_rfc3339();
        let id1 = Uuid::new_v4().to_string();
        let id2 = Uuid::new_v4().to_string();
        let id3 = Uuid::new_v4().to_string();
        
        let post1 = Post {
            id: id1.clone(),
            content: "投稿1".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        let post2 = Post {
            id: id2.clone(),
            content: "投稿2".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        let post3 = Post {
            id: id3.clone(),
            content: "投稿3".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        add_post_to_db(&conn, &post1).unwrap();
        add_post_to_db(&conn, &post2).unwrap();
        add_post_to_db(&conn, &post3).unwrap();
        
        // 投稿を取得して確認
        let posts = get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 3);

        // 一部の投稿だけ同期状態を更新
        update_sync_status_in_db(&mut conn, &[id1.clone(), id3.clone()], true).unwrap(); // Pass mutable reference

        // 更新後の状態を確認
        let posts = get_posts_from_db(&conn).unwrap();
        let mut synced_count = 0;
        
        for post in posts {
            if post.id == id1 || post.id == id3 {
                assert_eq!(post.is_synced, true);
                synced_count += 1;
            } else {
                assert_eq!(post.is_synced, false);
            }
        }
        
        assert_eq!(synced_count, 2);
    }
}
