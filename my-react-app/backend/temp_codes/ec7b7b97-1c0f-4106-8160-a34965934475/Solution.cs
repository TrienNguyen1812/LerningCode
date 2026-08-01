using System;
using System.Text;

namespace BaiTap
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = Encoding.UTF8;
            string inputA = Console.ReadLine();
            string inputB = Console.ReadLine();

            bool isNumberA = double.TryParse(inputA, out double length );
            bool isNumberB = double.TryParse(inputB, out double width);
            if(!isNumberA || !isNumberB || length <= 0 || width <= 0){
                Console.WriteLine("Đầu vào không hợp lệ");
            }
            else {
                double chuVi = ( length + width) * 2;
                double dienTich = length * width;

                Console.WriteLine($"Chu vi: {chuVi:F2}");
                Console.WriteLine($"Dien tich: {dienTich:F2}");
            }
        }
    }
}
