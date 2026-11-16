using backend_yenir.Data;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Base de datos: "SqlServer" (desarrollo local, por defecto) o "Postgres" (produccion).
// En produccion se configura con variables de entorno:
//   Database__Provider=Postgres
//   ConnectionStrings__DefaultConnection=postgresql://usuario:clave@host:5432/basedatos
var usePostgres = string.Equals(
    builder.Configuration["Database:Provider"],
    "Postgres",
    StringComparison.OrdinalIgnoreCase
);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";

if (usePostgres)
{
    // Permite guardar DateTime locales o sin zona, igual que en SQL Server.
    AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    var npgsqlConnection = ToNpgsqlConnectionString(connectionString);
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(npgsqlConnection));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}

var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("Jwt:SecretKey no configurada");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer no configurada");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience no configurada");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<BillPdfService>();
builder.Services.AddScoped<EmailTemplateService>();
builder.Services.AddScoped<OcrService>();
builder.Services.AddScoped<SinpeParserService>();
builder.Services.AddScoped<PaymentValidationService>();
// Origenes permitidos: los locales mas los de Cors:AllowedOrigins (separados por coma).
var allowedOrigins = new[] { "http://localhost:5000", "https://localhost:5000", "http://localhost:5173" }
    .Concat(
        (builder.Configuration["Cors:AllowedOrigins"] ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(o => o.TrimEnd('/'))
    )
    .Distinct()
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<ImageService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        if (builder.Environment.IsDevelopment())
        {
            options.JsonSerializerOptions.WriteIndented = true;
        }
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (usePostgres)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Las migraciones del proyecto son de SQL Server; en PostgreSQL el esquema
    // se crea directamente desde el modelo la primera vez.
    db.Database.EnsureCreated();

    // Si Admin:Email esta configurado, ese usuario (ya registrado) pasa a ser ADMIN.
    var adminEmail = app.Configuration["Admin:Email"];
    if (!string.IsNullOrWhiteSpace(adminEmail))
    {
        var normalized = adminEmail.Trim().ToLower();
        var admin = db.Users.FirstOrDefault(u => u.Email.ToLower() == normalized);
        if (admin != null && admin.Role != UserRole.ADMIN)
        {
            admin.Role = UserRole.ADMIN;
            db.SaveChanges();
        }
    }
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();
app.Run();

// Acepta tanto el formato de Npgsql (Host=...;Username=...) como una URL postgresql://
static string ToNpgsqlConnectionString(string value)
{
    if (
        !value.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        && !value.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase)
    )
        return value;

    var uri = new Uri(value);
    var userInfo = uri.UserInfo.Split(':', 2);
    var user = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var database = uri.AbsolutePath.TrimStart('/');
    var port = uri.Port > 0 ? uri.Port : 5432;

    return $"Host={uri.Host};Port={port};Database={database};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
