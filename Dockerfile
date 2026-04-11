# Use Nginx to serve the app
FROM nginx:stable-alpine

# 1. Clean Nginx root
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy Angular build files
# Note: Angular 18 puts files in dist/[project-name]/browser
COPY dist/ai-chat-ui/browser /usr/share/nginx/html/

# 3. Fix permissions
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# 4. Custom Nginx config for Angular Routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]