using System;
using System.Text;

namespace BaiTap
{
    class Program
    {
        static void Main(string[] args)
        {
            // Thi?t l?p mã hóa ti?ng Vi?t UTF-8 cho console
            Console.OutputEncoding = Encoding.UTF8;
            // 1. Đọc dữ liệu 2 dòng từ bàn phím
            string inputA = Console.ReadLine();
            string inputB = Console.ReadLine();

            // 2. Ép kiểu sang double (chuẩn InvariantCulture nhận dấu chấm thập phân ".")
            bool isNumberA = double.TryParse(inputA, NumberStyles.Any, CultureInfo.InvariantCulture, out double a);
            bool isNumberB = double.TryParse(inputB, NumberStyles.Any, CultureInfo.InvariantCulture, out double b);

            // 3. Kiểm tra điều kiện bài toán
            if (!isNumberA || !isNumberB || a <= 0 || b <= 0)
            {
                Console.WriteLine("Đầu vào không hợp lệ");
            }
            else
            {
                double chuVi = 2 * (a + b);
                double dienTich = a * b;

                // In kết quả ép dấu chấm thập phân dạng 3.50 thay vì 3,50
                Console.WriteLine(string.Create(CultureInfo.InvariantCulture, $"Chu vi: {chuVi:F2}"));
                Console.WriteLine(string.Create(CultureInfo.InvariantCulture, $"Dien tich: {dienTich:F2}"));
            }
        }
    }
}
