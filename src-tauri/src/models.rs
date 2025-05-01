use serde::{Serialize, Deserialize};

/// Post structure representing a user's post
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Post {
    /// Unique identifier for the post
    pub id: String,
    
    /// Content of the post
    pub content: String,
    
    /// Timestamp when the post was created (RFC3339 format)
    pub created_at: String,
    
    /// Timestamp when the post was last updated (RFC3339 format)
    pub updated_at: String,
    
    /// Flag indicating whether this post has been synchronized with the cloud storage
    pub is_synced: bool,
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;
    use chrono::Utc;

    #[test]
    fn test_post_serialization() {
        let now = Utc::now().to_rfc3339();
        let id = Uuid::new_v4().to_string();
        
        let post = Post {
            id: id.clone(),
            content: "Test content".to_string(),
            created_at: now.clone(),
            updated_at: now.clone(),
            is_synced: false,
        };
        
        // JSONシリアライズのテスト
        let json = serde_json::to_string(&post).unwrap();
        assert!(json.contains(&id));
        assert!(json.contains("Test content"));
        assert!(json.contains(&now));
        assert!(json.contains("false"));
        
        // JSONデシリアライズのテスト
        let deserialized: Post = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.id, id);
        assert_eq!(deserialized.content, "Test content");
        assert_eq!(deserialized.created_at, now);
        assert_eq!(deserialized.updated_at, now);
        assert_eq!(deserialized.is_synced, false);
    }
}
