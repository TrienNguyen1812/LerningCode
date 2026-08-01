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
            
            string inputA = Console.ReadLine();
            string inputB = Console.ReadLine();

            bool isNumberA = double.TryParse(inputA, out double longer);
            bool isNumberB = double.TryParse(inputB, out double width);

            if(!isNumberA || !isNumberB || a <= 0 || b <= 0){
                Console.WriteLine("Đầu vào không hợp lệ");
            }
            else{
                double chuVi = (longer + width) * 2;
                double dienTich = longer + width;

                Console.WriteLine($"Chu vi: {chuVi:F2}");
                Console.WriteLine($"Dien tich: {dienTich:F2}");
            }
        }
    }
}
