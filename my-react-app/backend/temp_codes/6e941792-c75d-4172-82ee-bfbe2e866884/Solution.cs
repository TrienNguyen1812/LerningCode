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
            
            string a = Console.ReadLine();
            string b = Console.ReadLine();

            bool isNumberA = double.TryParse(a, out double cd);
            bool isNumberB = double.TryParse(b, out double cr);

            if(!isNumberA || !isNumberB || a <= 0 || b <= 0){
                Console.WriteLine("Dữ liệu đầu vào không hợp lệ");
            }
            else{
                double cv = (cd + cr) * 2;
                double dt = cd * cr;

                Console.WriteLine($"Chu vi: {cv:F2}");
                Console.WriteLine($"Dien tich: {dt:F2}");
            }
        }
    }