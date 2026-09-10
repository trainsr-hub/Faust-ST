# .\setup_omniroute_machine_env.ps1

# ==========================================
# TÓM TẮT THAY ĐỔI VÀ FIX CODE:
# 1. Thêm khối kiểm tra quyền Administrator: Ngăn chặn script chạy và văng lỗi vô nghĩa nếu user quên mở "Run as Administrator".
# 2. Sửa ANTHROPIC_BASE_URL: Thêm "/v1" vào cuối URL để đảm bảo định dạng ghép chuỗi API chính xác cho OmniRoute.
# 3. Thêm thông báo khởi động lại: Biến cấp "Machine" không có tác dụng với các process đang chạy, bắt buộc phải kill và mở lại terminal.
# ==========================================

# [THAY ĐỔI] Kiểm tra quyền Administrator trước khi chạm vào Machine scope
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "LỖI: Bạn phải chạy PowerShell dưới quyền Administrator (Run as Administrator) để set biến cấp Machine."
    exit
}

# [THAY ĐỔI] Bổ sung /v1 vào sau port
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "http://localhost:20128/v1", "Machine")

[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "sk-ef33866b992de224-486e76-b0e8ca52", "Machine")

# [THAY ĐỔI] Lệnh này sẽ thực thi việc XÓA biến ANTHROPIC_API_KEY khỏi hệ thống
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "", "Machine")

[Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", "Faust-ST", "Machine")

Write-Host "Thực thi thành công. Bạn PHẢI TẮT VÀ MỞ LẠI toàn bộ các cửa sổ terminal (hoặc VS Code) để máy tính nạp lại biến môi trường mới."


omniroute

claude --dangerously-skip-permissions

powershell -ExecutionPolicy Bypass -File .\setup_sync_memory.ps1
(If the laptop also needs your OmniRoute environment variables, run your setup_omniroute_machine_env.ps1 as Administrator first).