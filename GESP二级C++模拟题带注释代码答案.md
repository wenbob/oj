# GESP C++ 二级模拟题带注释代码答案

对应文档：[GESP二级C++编程题型总结与模拟题.md](GESP二级C++编程题型总结与模拟题.md)

说明：以下代码均为每道题的独立参考程序。所有代码统一使用万能头文件 `#include <bits/stdc++.h>`，并尽量保留关键注释，方便对照题面理解。

## 专题一：区间枚举与素数判断

### 模拟题 1：区间素数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int L, R;
    cin >> L >> R;

    int ans = 0;
    for (int x = L; x <= R; x++) {
        bool prime = true;

        if (x < 2) {
            prime = false;
        }

        for (int i = 2; i * i <= x; i++) {
            if (x % i == 0) {
                prime = false;
                break;
            }
        }

        if (prime) {
            ans++;
        }
    }

    cout << ans << endl;
    return 0;
}
```

### 模拟题 2：素数求和

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;
    for (int x = 2; x <= n; x++) {
        bool prime = true;

        for (int i = 2; i * i <= x; i++) {
            if (x % i == 0) {
                prime = false;
                break;
            }
        }

        if (prime) {
            sum += x;
        }
    }

    cout << sum << endl;
    return 0;
}
```

### 模拟题 3：孪生素数对

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isPrime(int x) {
    if (x < 2) {
        return false;
    }
    for (int i = 2; i * i <= x; i++) {
        if (x % i == 0) {
            return false;
        }
    }
    return true;
}

int main() {
    int L, R;
    cin >> L >> R;

    int ans = 0;
    for (int p = L; p + 2 <= R; p++) {
        if (isPrime(p) && isPrime(p + 2)) {
            ans++;
        }
    }

    cout << ans << endl;
    return 0;
}
```

## 专题二：数位处理与美丽数

### 模拟题 1：数位和倍数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;

    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;

        int sum = 0;
        int t = x;
        while (t > 0) {
            sum += t % 10;
            t /= 10;
        }

        if (sum % k == 0) {
            cout << "Yes" << endl;
        } else {
            cout << "No" << endl;
        }
    }

    return 0;
}
```

### 模拟题 2：恰好出现

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int L, R, d, c;
    cin >> L >> R >> d >> c;

    int ans = 0;
    for (int x = L; x <= R; x++) {
        int t = x;
        int cnt = 0;

        while (t > 0) {
            if (t % 10 == d) {
                cnt++;
            }
            t /= 10;
        }

        if (cnt == c) {
            ans++;
        }
    }

    cout << ans << endl;
    return 0;
}
```

### 模拟题 3：最大数位和

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int bestSum = -1;
    int bestNumber = 0;

    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;

        int t = x;
        int sum = 0;
        while (t > 0) {
            sum += t % 10;
            t /= 10;
        }

        // 只在更大时更新，这样能保留第一个达到最大数位和的数。
        if (sum > bestSum) {
            bestSum = sum;
            bestNumber = x;
        }
    }

    cout << bestSum << " " << bestNumber << endl;
    return 0;
}
```

## 专题三：幂与特殊数判定

### 模拟题 1：四次方根

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int T;
    cin >> T;

    while (T--) {
        int x;
        cin >> x;

        long long ans = -1;
        for (long long a = 1; a * a * a * a <= x; a++) {
            long long value = a * a * a * a;

            if (value == x) {
                ans = a;
                break;
            }
        }

        cout << ans << endl;
    }

    return 0;
}
```

### 模拟题 2：自幂数计数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int L, R;
    cin >> L >> R;

    int ans = 0;
    for (int x = L; x <= R; x++) {
        int len = 0;
        int t = x;
        while (t > 0) {
            len++;
            t /= 10;
        }

        int sum = 0;
        t = x;
        while (t > 0) {
            int digit = t % 10;
            int power = 1;

            // 计算 digit 的 len 次方。
            for (int i = 1; i <= len; i++) {
                power *= digit;
            }

            sum += power;
            t /= 10;
        }

        if (sum == x) {
            ans++;
        }
    }

    cout << ans << endl;
    return 0;
}
```

### 模拟题 3：双平方数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int T;
    cin >> T;

    while (T--) {
        int x;
        cin >> x;

        bool ok = false;
        for (int a = 1; a * a < x; a++) {
            for (int b = 1; a * a + b * b <= x; b++) {
                if (a * a + b * b == x) {
                    ok = true;
                }
            }
        }

        if (ok) {
            cout << "Yes" << endl;
        } else {
            cout << "No" << endl;
        }
    }

    return 0;
}
```

## 专题四：循环模拟与递推过程

### 模拟题 1：做题计划

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b, m, n;
    cin >> a >> b >> m >> n;

    int total = 0;
    int day1 = a, day2 = b;

    for (int day = 1; day <= n; day++) {
        int today;

        if (day == 1) {
            today = day1;
        } else if (day == 2) {
            today = day2;
        } else {
            today = day1 + day2;
            day1 = day2;
            day2 = today;
        }

        total += today;

        if (today >= m) {
            break;
        }
    }

    cout << total << endl;
    return 0;
}
```

### 模拟题 2：数字黑洞

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int cnt = 0;
    while (n != 495) {
        int a = n / 100;
        int b = n / 10 % 10;
        int c = n % 10;

        int mx = max(a, max(b, c));
        int mn = min(a, min(b, c));
        int mid = a + b + c - mx - mn;

        int big = mx * 100 + mid * 10 + mn;
        int small = mn * 100 + mid * 10 + mx;

        n = big - small;
        cnt++;
    }

    cout << cnt << endl;
    return 0;
}
```

### 模拟题 3：环保能量升级

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int T;
    cin >> T;

    while (T--) {
        int n, x, y;
        cin >> n >> x >> y;

        // 基础能量 n 点；每 x 公里加 1 点；每 y 公里加 2 点。
        int ans = n + n / x + 2 * (n / y);

        cout << ans << endl;
    }

    return 0;
}
```

## 专题五：阈值控制与乘积范围

### 模拟题 1：乘积上限

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    long long product = 1;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;

        product *= x;
        if (product > 1000000) {
            cout << ">1000000" << endl;
            return 0;
        }
    }

    cout << product << endl;
    return 0;
}
```

### 模拟题 2：可承受乘积

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long M;
    cin >> n >> M;

    long long product = 1;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;

        product *= x;
        if (product > M) {
            cout << "Too Large" << endl;
            return 0;
        }
    }

    cout << product << endl;
    return 0;
}
```

### 模拟题 3：阶乘上限

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long M;
    cin >> n >> M;

    long long product = 1;
    for (int i = 1; i <= n; i++) {
        product *= i;

        if (product > M) {
            cout << "Too Large" << endl;
            return 0;
        }
    }

    cout << product << endl;
    return 0;
}
```

## 专题六：日期时间进位

### 模拟题 1：加一段小时

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isLeap(int y) {
    return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);
}

int monthDays(int y, int m) {
    if (m == 2) {
        if (isLeap(y)) {
            return 29;
        }
        return 28;
    }
    if (m == 4 || m == 6 || m == 9 || m == 11) {
        return 30;
    }
    return 31;
}

int main() {
    int y, m, d, h, k;
    cin >> y >> m >> d >> h >> k;

    h += k;
    while (h >= 24) {
        h -= 24;
        d++;

        if (d > monthDays(y, m)) {
            d = 1;
            m++;

            if (m > 12) {
                m = 1;
                y++;
            }
        }
    }

    cout << y << " " << m << " " << d << " " << h << endl;
    return 0;
}
```

### 模拟题 2：加若干天

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isLeap(int y) {
    return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);
}

int monthDays(int y, int m) {
    if (m == 2) {
        if (isLeap(y)) {
            return 29;
        }
        return 28;
    }
    if (m == 4 || m == 6 || m == 9 || m == 11) {
        return 30;
    }
    return 31;
}

int main() {
    int y, m, d, k;
    cin >> y >> m >> d >> k;

    for (int i = 1; i <= k; i++) {
        d++;

        if (d > monthDays(y, m)) {
            d = 1;
            m++;

            if (m > 12) {
                m = 1;
                y++;
            }
        }
    }

    cout << y << " " << m << " " << d << endl;
    return 0;
}
```

### 模拟题 3：跨年比赛

```cpp
#include <bits/stdc++.h>
using namespace std;

bool isLeap(int y) {
    return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);
}

int monthDays(int y, int m) {
    if (m == 2) {
        if (isLeap(y)) {
            return 29;
        }
        return 28;
    }
    if (m == 4 || m == 6 || m == 9 || m == 11) {
        return 30;
    }
    return 31;
}

int main() {
    int y, m, d, h, k;
    cin >> y >> m >> d >> h >> k;

    h += k;
    while (h >= 24) {
        h -= 24;
        d++;

        if (d > monthDays(y, m)) {
            d = 1;
            m++;

            if (m > 12) {
                m = 1;
                y++;
            }
        }
    }

    cout << y << " " << m << " " << d << " " << h << endl;
    return 0;
}
```

## 专题七：矩阵与字符画输出

### 模拟题 1：加号矩阵

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int mid = n / 2;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i == mid || j == mid) {
                cout << "+";
            } else {
                cout << ".";
            }
        }
        cout << endl;
    }

    return 0;
}
```

### 模拟题 2：口字矩阵

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (i == 0 || i == n - 1 || j == 0 || j == n - 1) {
                cout << "#";
            } else {
                cout << ".";
            }
        }
        cout << endl;
    }

    return 0;
}
```

### 模拟题 3：菱形边框

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int mid = n / 2;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            // 到中心点的横向距离加纵向距离等于 mid，就是菱形边框。
            if (abs(i - mid) + abs(j - mid) == mid) {
                cout << "#";
            } else {
                cout << ".";
            }
        }
        cout << endl;
    }

    return 0;
}
```

## 专题八：二维坐标与嵌套计数

### 模拟题 1：乘法矩阵

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (j > 1) {
                cout << " ";
            }
            cout << i * j;
        }
        cout << endl;
    }

    return 0;
}
```

### 模拟题 2：整数面积三角形

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int ans = 0;
    for (int a = 1; a <= n; a++) {
        for (int b = a; b <= n; b++) {
            // 面积 a*b/2 是整数，等价于 a*b 是偶数。
            if ((a * b) % 2 == 0) {
                ans++;
            }
        }
    }

    cout << ans << endl;
    return 0;
}
```

### 模拟题 3：圆内格点

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int H, W, R;
    cin >> H >> W >> R;

    int ans = 0;
    for (int i = 1; i <= H; i++) {
        for (int j = 1; j <= W; j++) {
            // 用平方比较，避免使用浮点数开方。
            if (i * i + j * j <= R * R) {
                ans++;
            }
        }
    }

    cout << ans << endl;
    return 0;
}
```
