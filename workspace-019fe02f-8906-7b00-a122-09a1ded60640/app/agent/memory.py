import json
import os
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

class MemorySystem:
    def __init__(self, path: str = "/home/user/app/data/memory.json"):
        self.path = path
        self.posts: List[Dict[str, Any]] = []
        self.topic_history: Dict[str, List[str]] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.posts = data.get("posts", [])
                    self.topic_history = data.get("topic_history", {})
            except Exception:
                pass

    def save(self):
        os.makedirs(os.path.dirname(self.path) if os.path.dirname(self.path) else ".", exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump({"posts": self.posts, "topic_history": self.topic_history}, f, indent=2, default=str)

    def add_post(self, post: Dict[str, Any]):
        self.posts.append(post)
        # Extract simple keywords from text
        text_lower = post.get("text", "").lower()
        keywords = set()
        for word in text_lower.split():
            w = word.strip(".,;:!?()[]{}\"'\n\r")
            if len(w) > 3 and w not in {"about","this","that","with","from","they","have","been","were","said","each","which","their","there","where","when","what","will","would","could","should","might","must","than","then","also","into","over","such","through","during","before","after","above","below","between","both","under","again","further","once","here","there","all","any","both","each","few","more","most","other","some","only","own","same","so","than","too","very","just","but","if","or","because","until","while","can","may","our","out","day","get","use","man","new","now","way","may","say","she","try","ask","end","why","let","put","say","she","try","way","own","say","too","old","tell","very","when","much","would","there","their","what","said","each","which","she","do","how","their","if","will","up","other","about","out","many","then","them","these","so","some","her","would","make","like","into","him","has","two","more","go","no","way","could","my","than","first","been","call","who","oil","its","now","find","long","down","day","did","get","come","made","may","part"}:
                keywords.add(w)
        for kw in keywords:
            self.topic_history.setdefault(kw, []).append(post.get("id", ""))
        self.save()

    def get_posts(self, limit=50) -> List[Dict[str, Any]]:
        # Sort by createdAt descending
        sorted_posts = sorted(self.posts, key=lambda x: x.get("createdAt", ""), reverse=True)
        return sorted_posts[:limit]

    def is_topic_recent(self, topic: str, days: int = 7) -> bool:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        t_lower = topic.lower()
        for post in self.posts:
            text_lower = post.get("text", "").lower()
            # Simple overlap check
            overlap = False
            for word in t_lower.split():
                w = word.strip(".,;:!?()[]{}\"'\n\r")
                if len(w) > 3 and w in text_lower:
                    overlap = True
                    break
            if overlap:
                ts_str = post.get("createdAt", "")
                try:
                    # Parse ISO
                    ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                    if ts.tzinfo is None:
                        ts = ts.replace(tzinfo=timezone.utc)
                    if ts > cutoff:
                        return True
                except Exception:
                    continue
        return False

    def get_unique_topics_covered(self) -> set:
        topics = set()
        for post in self.posts:
            for word in post.get("text", "").lower().split():
                w = word.strip(".,;:!?()[]{}\"'\n\r")
                if len(w) > 4 and w not in {"about","this","that","with","from","they","have","been","were","said","each","which","their","there","where","when","what","will","would","could","should","might","must","than","then","also","into","over","such","through","during","before","after","above","below","between","both","under","again","further","once","here","there","all","any","both","each","few","more","most","other","some","only","own","same","so","than","too","very","just","but","if","or","because","until","while","can","may","our","out","day","get","use","man","new","now","way","may","say","she","try","ask","end","why","let","put","say","she","try","way","own","say","too","old","tell","very","when","much","would","there","their","what","said","each","which","she","do","how","their","if","will","up","other","about","out","many","then","them","these","so","some","her","would","make","like","into","him","has","two","more","go","no","way","could","my","than","first","been","call","who","oil","its","now","find","long","down","day","did","get","come","made","may","part","have","been","were","said","each","which","they","have","been","were","said"}:
                    topics.add(w)
        return topics
