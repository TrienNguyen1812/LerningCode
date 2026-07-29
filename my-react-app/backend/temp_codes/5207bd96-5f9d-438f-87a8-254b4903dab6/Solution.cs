using System;
class Program {
  static void Main() {
    string input = Console.ReadLine();
        
        if (!string.IsNullOrEmpty(input))
        {
            // Tách chuỗi thành mảng các số dựa vào dấu cách
            string[] parts = input.Split(' ');
            
            int a = int.Parse(parts[0]);
            int b = int.Parse(parts[1]);

            // So sánh dùng if - else và in ra số lớn nhất
            if (a > b)
            {
                Console.WriteLine(a)
            }
            else
            {
                Console.WriteLine(b)
            }
        } 
  }
}