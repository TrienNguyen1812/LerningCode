using System;
using System.Text;

namespace MyProject
{
    class Program
    {
        static void Main(string[] args)
        {
            // Thi?t l?p b?ng mã console sang UTF-8 d? hi?n th? ti?ng Vi?t có d?u chính xác
            Console.OutputEncoding = Encoding.UTF8;
            string inputA = Console.ReadLine();
            string inputB = Console.ReadLine();

            bool isNumberA = double.TryParse(inputA, out double a);
            bool isNumberB = double.TryParse(inputB, out double b);

            if(!isNumberA || !isNumberB || a <= 0 || b <= 0){
                Console.WriteLine("Dữ liệu đầu vào không hợp lệ");
            }
            else{
                double chuVi = (a + b) * 2;
                double dienTich = a * b;

                Console.WriteLine($"Chu vi: {chuVi:F2}");
                Console.WriteLine($"Dien tich: {dienTich:F2}");
            }
        }
    }
}