# Web build of the Expo app, served by nginx.
#   docker build -t ausflugfinder-web \
#     --build-arg EXPO_PUBLIC_SUPABASE_URL=... \
#     --build-arg EXPO_PUBLIC_SUPABASE_ANON_KEY=... \
#     --build-arg EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=... \
#     --build-arg EXPO_PUBLIC_OPENWEATHER_API_KEY=... .
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
ARG EXPO_PUBLIC_OPENWEATHER_API_KEY
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL \
    EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY \
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=$EXPO_PUBLIC_GOOGLE_MAPS_API_KEY \
    EXPO_PUBLIC_OPENWEATHER_API_KEY=$EXPO_PUBLIC_OPENWEATHER_API_KEY
RUN npx expo export --clear --platform web

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
