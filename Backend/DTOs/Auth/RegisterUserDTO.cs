using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Auth
{
    public class RegisterUserDTO
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        public DateTime BirthDay { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(8)]
        public string Password { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public string Gender { get; set; }

        [Required]
        public string Province { get; set; }

        [Required]
        public string Canton { get; set; }

        [Required]
        public string District { get; set; }

        [Required]
        public string ExactAddress { get; set; }
    }
}
