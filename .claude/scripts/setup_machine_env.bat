:: .\setup_machine_env.bat
@echo off

:: Kiem tra quyen Administrator (Bat buoc de ghi vao Machine)
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo LOI CHAC CHAN: Ban phai chay file nay bang "Run as Administrator".
    pause
    exit /b
)

echo ========================================
echo CHON THIET BI DE NAP ANTHROPIC_AUTH_TOKEN
echo ========================================
echo 1. DESKTOP
echo 2. Mini PC
set /p device="Nhap lua chon (1 hoac 2): "

if "%device%"=="1" (
    set CHOSEN_TOKEN=sk-a1e8e01049e107ca-6f48f8-99e32015
) else if "%device%"=="2" (
    :: Ban phai thay the dong duoi bang Token that cua Mini PC truoc khi chay
    set CHOSEN_TOKEN=sk-mini-pc-placeholder-token
) else (
    echo Lua chon khong hop le. Huy bo.
    pause
    exit /b
)

echo.
echo Dang ghi bien moi truong vao Registry cua Windows 11...

:: Ghi cac bien vao Machine Scope
setx ANTHROPIC_AUTH_TOKEN "%CHOSEN_TOKEN%" /m
setx ANTHROPIC_BASE_URL "http://localhost:20128/v1" /m
setx CLAUDE_CODE_DISABLE_UNKNOWN_MODEL_WINDOW_ENFORCEMENT "1" /m
setx ANTHROPIC_MODEL "Faust-ST" /m

:: Xoa so hoan toan ANTHROPIC_API_KEY khoi he thong thay vi set chuoi rong de tranh loi cu phap cua setx
REG delete "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /F /V ANTHROPIC_API_KEY >nul 2>&1

:: ==========================================
:: TÓM TẮT THAY ĐỔI VÀ FIX CODE:
:: Input: Yêu cầu chuyển config lên cấp Machine và rẽ nhánh chọn thiết bị cho Token.
:: Output: Script Batch chạy quyền Admin, tương tác người dùng, ghi vĩnh viễn vào Windows Registry.
:: Thay đổi 1: Bổ sung "net session" để ép buộc quyền Admin, nếu không setx /m sẽ văng lỗi Access Denied.
:: Thay đổi 2: Thêm luồng "set /p" lấy input (1 hoặc 2) để quyết định giá trị CHOSEN_TOKEN tương ứng cho DESKTOP hoặc Mini PC.
:: Thay đổi 3: Thay toàn bộ "set" (Process scope) thành "setx /m" (Machine scope).
:: Thay đổi 4: Sử dụng REG delete thay vì setx để xử lý ANTHROPIC_API_KEY. Lệnh setx trên Windows rất ngu ngốc khi xử lý chuỗi rỗng (""), dùng REG delete đảm bảo key bị triệt tiêu tận gốc.
:: ==========================================

echo.
echo HOAN TAT SETUP!
echo CANH BAO: Ban phai tat TOAN BO cac cua so VS Code va Terminal hien co, roi mo lai de he thong nap bien moi.
pause