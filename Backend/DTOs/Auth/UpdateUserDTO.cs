using System.ComponentModel.DataAnnotations;

namespace backend_yenir.DTOs.Auth
{
    public class UpdateUserDTO
    {
        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string LastName { get; set; } = null!;

        [Required]
        public DateTime BirthDay { get; set; }

        [Required]
        public string PhoneNumber { get; set; } = null!;

        [Required]
        public string Gender { get; set; } = null!;

        public string? Province { get; set; }
        public string? Canton { get; set; }
        public string? District { get; set; }
        public string? ExactAddress { get; set; }
    }
}
