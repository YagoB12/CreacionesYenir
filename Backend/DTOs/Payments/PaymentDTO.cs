using backend_yenir.Models;

namespace backend_yenir.DTOs.Payments
{
    public class PaymentDTO
    {
        public List<OrderPaymentDTO> orderPayment { get; set; } = new();
        public IFormFile? Img { get; set; }
    }
}
