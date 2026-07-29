using System;

namespace Problem
{
    class Program
    {
        static void Main(string[] args)
        {
           Console.OutputEncoding = Encoding.UTF8;

            string inputA = Console.ReadLine();
            string inputB = Console.ReadLine();

            // Đổi từ int.TryParse sang long.TryParse
            bool isNumberA = long.TryParse(inputA, out long a);
            bool isNumberB = long.TryParse(inputB, out long b);

            if (!isNumberA || !isNumberB)
            {
                Console.WriteLine("Dữ liệu đầu vào phải là số");
            }
            else if (a == 0 || b == 0)
            {
                Console.WriteLine("Cạnh phải lớn hơn 0");
            }
            else if (a < 0 || b < 0)
            {
                Console.WriteLine("Cạnh không được âm");
            }
            else
            {
                // Biến dientich kiểu long sẽ tính được số lên tới hàng tỷ tỷ
                long dientich = a * b; 
                Console.WriteLine(dientich);
            }
        }
    }
}