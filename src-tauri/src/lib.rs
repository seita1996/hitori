// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod db;
pub mod models;

use models::Post;

/// Greet the user
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Get all posts from the database
#[tauri::command]
fn get_posts() -> Result<Vec<Post>, String> {
    db::get_posts()
}

/// Add a new post to the database
#[tauri::command]
fn add_post(content: String) -> Result<Post, String> {
    db::add_post(content)
}

/// Delete a post from the database
#[tauri::command]
fn delete_post(id: String) -> Result<(), String> {
    db::delete_post(id)
}

/// Update the sync status of multiple posts
#[tauri::command]
fn update_sync_status(ids: Vec<String>, is_synced: bool) -> Result<(), String> {
    db::update_sync_status(ids, is_synced)
}

/// Run the Tauri application
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

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;
    use chrono::Utc;
    use uuid::Uuid;
    
    // モックAppHandleの代わりに、インメモリデータベースを使用してテスト
    fn setup_test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        db::init_db_for_test(&conn).unwrap();
        conn
    }
    
    #[test]
    fn test_greet() {
        let result = greet("World");
        assert_eq!(result, "Hello, World! You've been greeted from Rust!");
    }
    
    #[test]
    fn test_crud_operations_directly() {
        // テスト用DBをセットアップ
        let mut conn = setup_test_db(); // Make conn mutable
        
        // 投稿を追加
        let content = "Test post";
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();
        
        let post = Post {
            id: id.clone(),
            content: content.to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        // データベース操作のテスト
        db::add_post_to_db(&conn, &post).unwrap();
        
        // 投稿を取得して確認
        let posts = db::get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 1);
        assert_eq!(posts[0].id, id);
        assert_eq!(posts[0].content, content);
        assert_eq!(posts[0].is_synced, false);
        
        // 同期状態を更新
        db::update_sync_status_in_db(&mut conn, &[id.clone()], true).unwrap(); // Pass mutable reference
        
        // 更新後の状態を確認
        let posts = db::get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 1);
        assert_eq!(posts[0].is_synced, true);
        
        // 投稿を削除
        db::delete_post_from_db(&conn, &id).unwrap();
        
        // 削除後に投稿がないことを確認
        let posts = db::get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 0);
    }
    
    #[test]
    fn test_multiple_posts() {
        // テスト用DBをセットアップ
        let mut conn = setup_test_db(); // Make conn mutable
        
        // テスト用の投稿を複数追加
        let now = Utc::now().to_rfc3339();
        let id1 = Uuid::new_v4().to_string();
        let id2 = Uuid::new_v4().to_string();
        let id3 = Uuid::new_v4().to_string();
        
        let post1 = Post {
            id: id1.clone(),
            content: "Post 1".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        let post2 = Post {
            id: id2.clone(),
            content: "Post 2".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        let post3 = Post {
            id: id3.clone(),
            content: "Post 3".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        db::add_post_to_db(&conn, &post1).unwrap();
        db::add_post_to_db(&conn, &post2).unwrap();
        db::add_post_to_db(&conn, &post3).unwrap();
        
        // 投稿を取得して確認
        let posts = db::get_posts_from_db(&conn).unwrap();
        assert_eq!(posts.len(), 3);
        
        // 一部の投稿だけ同期状態を更新
        db::update_sync_status_in_db(&mut conn, &[id1.clone(), id3.clone()], true).unwrap(); // Pass mutable reference
        
        // 更新後の状態を確認
        let posts = db::get_posts_from_db(&conn).unwrap();
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
