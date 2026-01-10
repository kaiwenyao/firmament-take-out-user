server {
    listen 80;
    server_name localhost;

    # 1. 静态资源
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # 2. 接口转发
    location /api/ {
        # 将 /api/xxx 替换为 /user/xxx
        rewrite ^/api/(.*)$ /user/$1 break;

        # 转发给后端
        proxy_pass http://${FIRMAMENT_SERVER_HOST}:${FIRMAMENT_SERVER_PORT};

        # 标准头部配置
        # test github actions
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
