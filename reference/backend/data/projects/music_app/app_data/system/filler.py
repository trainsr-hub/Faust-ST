# path: D:\My Drive\Sync\My Obsidian Vaults\Main\GIF\Blue_Rose\data\projects\music_app\app_data\system\filler.py
import sqlite3
import shutil
import os

def get_exclude_ids(db_path: str) -> set:
    """Quét toàn bộ bảng trong DB, nếu bảng có cột 'id' thì lấy dữ liệu."""
    exclude_ids = set()
    if not os.path.exists(db_path):
        print(f"Cảnh báo: Không tìm thấy file {db_path}")
        return exclude_ids
    
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        for table_name in tables:
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'id' in columns:
                cursor.execute(f"SELECT id FROM {table_name};")
                exclude_ids.update(row[0] for row in cursor.fetchall() if row[0] is not None)
                
    return exclude_ids

def main():
    db_black_list = "black_list.db"
    db_bad_kpi = "bad_kpi_list.db"
    
    exclude = set()
    exclude.update(get_exclude_ids(db_black_list))
    exclude.update(get_exclude_ids(db_bad_kpi))
    
    if not exclude:
        print("Tập exclude trống. Không có id nào để lọc.")
        
    source_db = "rawinfo.db"
    target_db = "_1_static.db"
    
    if not os.path.exists(source_db):
        raise FileNotFoundError(f"Lỗi: File gốc {source_db} không tồn tại.")
        
    print(f"Sao chép {source_db} -> {target_db}...")
    shutil.copy2(source_db, target_db)
    
    print(f"Đang xóa các row chứa id thuộc exclude khỏi {target_db}...")
    with sqlite3.connect(target_db) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        
        for table_name in tables:
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = [col[1] for col in cursor.fetchall()]
            
            if 'id' in columns:
                exclude_list = list(exclude)
                batch_size = 900 
                for i in range(0, len(exclude_list), batch_size):
                    batch = exclude_list[i:i+batch_size]
                    placeholders = ','.join(['?'] * len(batch))
                    query = f"DELETE FROM {table_name} WHERE id IN ({placeholders})"
                    cursor.execute(query, batch)
        
        # ---------------------------------------------------------
        # --- START CHANGED SECTION ---
        # ---------------------------------------------------------
        # Commit để đóng transaction của loạt lệnh DELETE bên trên
        conn.commit() 
        
        print("Đang tối ưu hóa dung lượng (VACUUM)...")
        # Đưa connection về chế độ autocommit để cho phép chạy VACUUM
        conn.isolation_level = None 
        conn.execute("VACUUM;")
        # Trả lại isolation_level mặc định của sqlite3 Python
        conn.isolation_level = "" 
        # ---------------------------------------------------------
        # --- END CHANGED SECTION ---
        # ---------------------------------------------------------
        
    print("Hoàn tất.")

if __name__ == "__main__":
    main()