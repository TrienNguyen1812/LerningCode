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

            bool isNumberA = double.TryParse(inputA, out double a);
            bool isNumberB = double.TryParse(inputB, out double b);

            if(!inputA || !inputB || a <= 0 || b <= 0){
                Console.WriteLine("Đầu vào không hợp lệ");
            }
            else{
                double chuVi = (a + b) * 2;
                double dienTich = a * b;

                Console.WriteLine($"Chu vi: {chuVi:F2} ");
                Console.WriteLine($"Dien tich: {dienTich:F2}");
            }
        }
    }
}
