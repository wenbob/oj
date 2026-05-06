# GESP C++ 一级模拟题带注释代码答案

对应文档：[GESP一级C++编程题型总结与模拟题.md](GESP一级C++编程题型总结与模拟题.md)

说明：以下代码均为每道题的独立参考程序。注释尽量保留关键思路，适合一级学生对照题面理解。

## 专题一：日期与时间换算

### 模拟题 1：下课时间

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int h, m, t;
    cin >> h >> m >> t;

    // 先统一换算成从 0 点开始经过的总分钟数。
    int total = h * 60 + m + t;

    cout << total / 60 << " " << total % 60 << endl;
    return 0;
}
```

### 模拟题 2：训练日

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int w, d;
    cin >> w >> d;

    // w-1 先变成从 0 开始编号，取余后再加 1 变回 1 到 7。
    int ans = (w - 1 + d) % 7 + 1;

    cout << ans << endl;
    return 0;
}
```

### 模拟题 3：闹钟提醒

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int h, m, s, t;
    cin >> h >> m >> s >> t;

    // 把当前时刻和等待时间都换算成秒。
    int total = h * 3600 + m * 60 + s + t;

    int day = total / 86400 + 1;  // 当前这一天是第 1 天。
    int rest = total % 86400;     // 闹钟响起当天已经过去的秒数。

    int hh = rest / 3600;
    rest %= 3600;
    int mm = rest / 60;
    int ss = rest % 60;

    cout << day << " " << hh << " " << mm << " " << ss << endl;
    return 0;
}
```

## 专题二：购物计费与整除取余

### 模拟题 1：买练习本

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, p;
    cin >> m >> p;

    // 整除得到最多能买的本数，取余得到剩余的钱。
    cout << m / p << endl;
    cout << m % p << endl;

    return 0;
}
```

### 模拟题 2：成套水果

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, a, b;
    cin >> m >> a >> b;

    int price = a + b;       // 一套水果的价格。
    int cnt = m / price;     // 最多购买套数。
    int left = m % price;    // 剩余的钱。

    cout << cnt << " " << left << endl;
    return 0;
}
```

### 模拟题 3：打印作业

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k, p;
    cin >> n >> k >> p;

    // 不足一包也算一包，所以使用向上取整。
    int packs = (n + k - 1) / k;
    int cost = packs * p;

    cout << packs << " " << cost << endl;
    return 0;
}
```

## 专题三：分段判断与格式化实数

### 模拟题 1：体温提示

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    double t;
    cin >> t;

    if (t < 36.0) {
        cout << "Low" << endl;
    } else if (t > 37.2) {
        cout << "High" << endl;
    } else {
        cout << "Normal" << endl;
    }

    return 0;
}
```

### 模拟题 2：会员折扣

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    double p;
    int g;
    cin >> p >> g;

    if (g == 1) {
        p *= 0.9;
    } else if (g == 2) {
        p *= 0.8;
    }

    // 使用 printf 按题目要求保留两位小数。
    printf("%.2f\n", p);
    return 0;
}
```

### 模拟题 3：包裹计费

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int w, d;
    cin >> w >> d;

    int cost = 8;

    if (w > 1000) {
        int extra = w - 1000;
        // 超出部分不足 500 克也按 500 克计算。
        int blocks = (extra + 500 - 1) / 500;
        cost += blocks * 3;
    }

    if (d > 100) {
        cost += 5;
    }

    cout << cost << endl;
    return 0;
}
```

## 专题四：循环枚举与条件计数

### 模拟题 1：能被 3 整除

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;

        if (x % 3 == 0) {
            cnt++;
        }
    }

    cout << cnt << endl;
    return 0;
}
```

### 模拟题 2：跳过幸运号

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;

    for (int i = 1; i <= n; i++) {
        // 不是 k 的倍数才输出。
        if (i % k != 0) {
            cout << i << endl;
        }
    }

    return 0;
}
```

### 模拟题 3：区间特殊数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int L, R, a, b;
    cin >> L >> R >> a >> b;

    int sum = 0;
    for (int i = L; i <= R; i++) {
        // 特殊数：是 a 的倍数，但不是 b 的倍数。
        if (i % a == 0 && i % b != 0) {
            sum += i;
        }
    }

    cout << sum << endl;
    return 0;
}
```

## 专题五：因数倍数与特殊数判定

### 模拟题 1：因数个数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        if (n % i == 0) {
            cnt++;
        }
    }

    cout << cnt << endl;
    return 0;
}
```

### 模拟题 2：完全平方数

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    bool ok = false;
    for (int i = 1; i * i <= n; i++) {
        if (i * i == n) {
            ok = true;
        }
    }

    if (ok) {
        cout << "Yes" << endl;
    } else {
        cout << "No" << endl;
    }

    return 0;
}
```

### 模拟题 3：下一次共同值日

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b, d;
    cin >> a >> b >> d;

    int day = d + 1;
    while (true) {
        // 同时是 a 和 b 的倍数，说明两人同一天值日。
        if (day % a == 0 && day % b == 0) {
            cout << day << endl;
            break;
        }
        day++;
    }

    return 0;
}
```

## 专题六：累加与图形数量

### 模拟题 1：偶数求和

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += 2 * i;  // 第 i 个正偶数是 2*i。
    }

    cout << sum << endl;
    return 0;
}
```

### 模拟题 2：台阶砖块

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }

    cout << sum << endl;
    return 0;
}
```

### 模拟题 3：训练积分

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int total = 0;
    for (int day = 1; day <= n; day++) {
        int today = 0;

        // 计算第 day 天获得的 1+2+...+day。
        for (int i = 1; i <= day; i++) {
            today += i;
        }

        total += today;
    }

    cout << total << endl;
    return 0;
}
```

## 专题七：数位处理

### 模拟题 1：数位和

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int sum = 0;
    while (n > 0) {
        sum += n % 10;  // 取出个位并加入答案。
        n /= 10;        // 去掉个位。
    }

    cout << sum << endl;
    return 0;
}
```

### 模拟题 2：奇数数位

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    int cnt = 0;
    while (n > 0) {
        int digit = n % 10;

        if (digit % 2 == 1) {
            cnt++;
        }

        n /= 10;
    }

    cout << cnt << endl;
    return 0;
}
```

### 模拟题 3：替换幸运数字

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n;
    cin >> n;

    long long ans = 0;
    long long place = 1;  // 当前数位的位权：1、10、100……
    int cnt = 0;

    while (n > 0) {
        int digit = n % 10;

        if (digit == 7) {
            digit = 1;
            cnt++;
        }

        ans += digit * place;
        place *= 10;
        n /= 10;
    }

    cout << ans << " " << cnt << endl;
    return 0;
}
```

## 专题八：最值比较与绝对值

### 模拟题 1：接近目标分

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    int db = b - a;
    if (db < 0) {
        db = -db;
    }

    int dc = c - a;
    if (dc < 0) {
        dc = -dc;
    }

    if (db < dc) {
        cout << b << endl;
    } else if (dc < db) {
        cout << c << endl;
    } else {
        // 距离相同，输出较小的成绩。
        if (b < c) {
            cout << b << endl;
        } else {
            cout << c << endl;
        }
    }

    return 0;
}
```

### 模拟题 2：最高和最低

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;

    int mx = a, mn = a;

    if (b > mx) {
        mx = b;
    }
    if (c > mx) {
        mx = c;
    }

    if (b < mn) {
        mn = b;
    }
    if (c < mn) {
        mn = c;
    }

    cout << mx << " " << mn << endl;
    return 0;
}
```

### 模拟题 3：最合适的座位

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int x, a, b, c, d;
    cin >> x >> a >> b >> c >> d;

    int ans = a;

    int best = ans - x;
    if (best < 0) {
        best = -best;
    }

    int dist = b - x;
    if (dist < 0) {
        dist = -dist;
    }
    if (dist < best || (dist == best && b < ans)) {
        best = dist;
        ans = b;
    }

    dist = c - x;
    if (dist < 0) {
        dist = -dist;
    }
    if (dist < best || (dist == best && c < ans)) {
        best = dist;
        ans = c;
    }

    dist = d - x;
    if (dist < 0) {
        dist = -dist;
    }
    if (dist < best || (dist == best && d < ans)) {
        best = dist;
        ans = d;
    }

    cout << ans << endl;
    return 0;
}
```
