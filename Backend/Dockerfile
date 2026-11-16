FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend-yenir.csproj .
RUN dotnet restore backend-yenir.csproj
COPY . .
RUN dotnet publish backend-yenir.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
# Librerias nativas para Tesseract (OCR de comprobantes SINPE) y fuentes para los PDF
RUN apt-get update \
    && apt-get install -y --no-install-recommends libtesseract5 liblept5 libfontconfig1 fonts-liberation \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/lib/x86_64-linux-gnu/libdl.so.2 /usr/lib/x86_64-linux-gnu/libdl.so
WORKDIR /app
COPY --from=build /app/publish .
COPY --from=build /src/tessdata ./tessdata
# El paquete NuGet Tesseract busca estas librerias con nombre de Windows dentro de x64/
RUN mkdir -p /app/x64 /app/wwwroot/images/products \
    && ln -sf /usr/lib/x86_64-linux-gnu/liblept.so.5 /app/x64/libleptonica-1.82.0.so \
    && ln -sf /usr/lib/x86_64-linux-gnu/libtesseract.so.5 /app/x64/libtesseract50.so
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000
ENTRYPOINT ["dotnet", "backend-yenir.dll"]
