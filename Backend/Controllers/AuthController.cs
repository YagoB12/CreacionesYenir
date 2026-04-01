using System.Data;
using backend_yenir.Data;
using backend_yenir.DTOs.Auth;
using backend_yenir.Helpers;
using backend_yenir.Models;
using backend_yenir.Models.Enums;
using backend_yenir.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_yenir.Controllers
{
    /// <summary>
    /// Controlador de autenticación.
    ///
    /// Maneja:
    /// - Registro de nuevos usuarios
    /// - Login y generación de tokens
    /// - Actualización de datos de usuario
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        /// <summary>
        /// Registra un nuevo usuario en el sistema.
        ///
        /// POST /api/auth/register
        ///
        /// Validaciones:
        /// - El email no debe estar registrado
        /// - Todos los campos son obligatorios
        /// - La contraseña se hashea antes de guardarse
        ///
        /// El nuevo usuario siempre tiene rol CLIENT.
        /// </summary>
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterUserDTO dto)
        {
            // Validar datos del formulario
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Verificar que el email no esté registrado
            var emailExists = _context.Users.Any(u => u.Email == dto.Email);
            if (emailExists)
                return BadRequest("El correo ya está registrado");

            // Crear el nuevo usuario
            var user = new User
            {
                Name = dto.Name,
                LastName = dto.LastName,
                BirthDay = dto.BirthDay,
                Email = dto.Email,
                PasswordHash = PasswordHasher.Hash(dto.Password), // Hashear contraseña
                Role = UserRole.CLIENT, // Rol por defecto
                PhoneNumber = dto.PhoneNumber,
                Gender = dto.Gender,
                Province = dto.Province,
                Canton = dto.Canton,
                District = dto.District,
                ExactAddress = dto.ExactAddress,
            };

            // Guardar en base de datos
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok("Usuario registrado correctamente");
        }

        /// <summary>
        /// Autentica un usuario y devuelve un token JWT.
        ///
        /// POST /api/auth/login
        ///
        /// Proceso:
        /// 1. Valida credenciales llamando al SP sp_ValidateUser
        /// 2. Si son correctas, genera un token
        /// 3. Devuelve el token + info del usuario
        ///
        /// El cliente debe guardar el token y usarlo en futuras peticiones.
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginUserDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Hashear la contraseña para comparar
            var passwordHash = PasswordHasher.Hash(dto.Password);

            // Llamar al procedimiento almacenado sp_ValidateUser
            await using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            await using var command = connection.CreateCommand();
            command.CommandText = "sp_ValidateUser";
            command.CommandType = CommandType.StoredProcedure;

            // Enviar parámetros al SP
            var pEmail = command.CreateParameter();
            pEmail.ParameterName = "@Email";
            pEmail.Value = dto.Email;
            pEmail.DbType = DbType.String;
            command.Parameters.Add(pEmail);

            var pPassword = command.CreateParameter();
            pPassword.ParameterName = "@PasswordHash";
            pPassword.Value = passwordHash;
            pPassword.DbType = DbType.String;
            command.Parameters.Add(pPassword);

            // Ejecutar el SP (devuelve 1 si es válido, 0 si no)
            var result = await command.ExecuteScalarAsync();

            if (result == null || Convert.IsDBNull(result))
                return Unauthorized("Credenciales inválidas");

            var valid = Convert.ToInt32(result);
            if (valid <= 0)
                return Unauthorized("Credenciales inválidas");

            // Obtener el usuario y generar token
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            var token = _jwtService.GenerateToken(user!);

            return Ok(
                new
                {
                    message = "Autenticación correcta",
                    userId = user?.Id,
                    email = user?.Email,
                    name = user?.Name,
                    role = user?.Role.ToString(),
                    token = token, //  Guardar en cliente
                }
            );
        }

        /// <summary>
        /// Actualiza datos del usuario (nombre, teléfono, dirección, etc.).
        ///
        /// PUT /api/auth/update/{id}
        ///
        /// No cambia email, contraseña ni rol.
        /// </summary>
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return NotFound("Usuario no encontrado");

            // Actualizar solo datos personales
            user.Name = dto.Name;
            user.LastName = dto.LastName;
            user.BirthDay = dto.BirthDay;
            user.PhoneNumber = dto.PhoneNumber;
            user.Gender = dto.Gender;
            user.Province = dto.Province;
            user.Canton = dto.Canton;
            user.District = dto.District;
            user.ExactAddress = dto.ExactAddress;

            await _context.SaveChangesAsync();

            return Ok("Usuario actualizado correctamente");
        }
    }
}
