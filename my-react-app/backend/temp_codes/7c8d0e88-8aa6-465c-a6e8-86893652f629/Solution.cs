using System;

namespace Problem
{
    class Program
    {
        static void Main(string[] args)
        {
            int a = int.Parse(Console.ReadLine());
            int b = int.Parse(Console.ReadLine());
            if(a == 0 || b == 0 )
            {
                Console.WriteLine("Cạnh phải lớn hơn 0");
            }
            else if(a < 0 || b < 0)
            {
                Console.WriteLine("Cạnh không được âm");
            }
            else
            {
            int dientich = a * b;
            Console.WriteLine(dientich);
            }
        }
    }
}