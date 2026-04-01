using System.ComponentModel.DataAnnotations;
using backend_yenir.Models.Enums;

namespace backend_yenir.DTOs.Auth
{
    public class UpdateUserRoleDTO
    {
        [Required]
        public UserRole Role { get; set; }
    }
}
