namespace backend_yenir.DTOs
{
    public class ValidationResultDto
    {
        public bool AmountMatch { get; set; }

        public bool ReferenceMatch { get; set; }

        public bool DestinationPhoneMatch { get; set; }

        public bool DestinationNameMatch { get; set; }

        public bool DateMatch { get; set; }

        public bool TimeMatch { get; set; }

        public int Score { get; set; }

        public string Result { get; set; } = string.Empty;

        public int Status { get; set; }
    }
}