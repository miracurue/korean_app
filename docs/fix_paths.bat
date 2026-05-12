@echo off
if not exist "e:\my_projects\korean_app\frontend\public\pics\quotes" mkdir "e:\my_projects\korean_app\frontend\public\pics\quotes"
move "e:\my_projects\korean_app\frontend\public\media\quotes\*" "e:\my_projects\korean_app\frontend\public\pics\quotes\"
rmdir "e:\my_projects\korean_app\frontend\public\media\quotes"
