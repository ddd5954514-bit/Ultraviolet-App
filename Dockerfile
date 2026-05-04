FROM alpine:latest

WORKDIR /app

# התקנת כלים נדרשים, הורדת Xray-core והרשאות הרצה
RUN apk add --no-cache wget unzip ca-certificates \
    && wget -O xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip \
    && unzip xray.zip \
    && rm xray.zip \
    && chmod +x xray

# העתקת קובץ התצורה שיצרנו
COPY config.json .

# הגדרת הפורט שעליו Hugging Face מאזין
ENV PORT=7860
EXPOSE 7860

# הפעלת ליבת VLESS
CMD ["./xray", "-config", "config.json"]
