using System;

namespace Problem
{
    class Program
    {
        static void Main(string[] args)
        {
            int a = int.Parse(Console.ReadLine());
            int b = int.Parse(Console.ReadLine());

            // 1. Kiểm tra số âm TRƯỚC
            if (a < 0 || b < 0)
            {
                Console.WriteLine("Cạnh không được âm");
            }
            // 2. Kiểm tra số 0 SAU
            else if (a == 0 || b == 0)
            {
                Console.WriteLine("Cạnh phải lớn hơn 0");
            }
            // 3. Trường hợp hợp lệ -> Tính diện tích
            else
            {
                int dientich = a * b;
                Console.WriteLine(dientich);
            }
        }
    }
}