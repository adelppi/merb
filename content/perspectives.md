# 数式の英語読み 並べ替え問題 出題観点

## 1. 数（numbers）

| 観点 | 例 | LaTeX |
|---|---|---|
| 大きな数で a / one を落とさない | 100 → *a hundred* | `100` |
| 千・百万・十億の単位 | 3,000,000 → *three million* | `3{,}000{,}000` |
| 小数は point の後を1桁ずつ読む | 2.47 → *two point four seven* | `2.47` |
| 循環小数 | 0.666… → *zero point six recurring* | `0.666\ldots` |
| 指数表記（10の累乗） | 3 × 10⁴ → *three times ten to the fourth* | `3 \times 10^4` |
| 負の指数 | 2 × 10⁻⁵ → *two times ten to the minus five* | `2 \times 10^{-5}` |

## 2. 分数（fractions）

| 観点 | 例 | LaTeX |
|---|---|---|
| 一般形 over | a/b → *a over b* | `\frac{a}{b}` |
| 序数を使う読み方 | 1/5 → *one fifth* | `\frac{1}{5}` |
| 分子が2以上なら複数形 | 2/7 → *two sevenths* | `\frac{2}{7}` |
| half / quarter | 3/4 → *three quarters* | `\frac{3}{4}` |
| 帯分数は and でつなぐ | 1 ½ → *one and a half* | `1\frac{1}{2}` |

## 3. 添え字・累乗・根号（suffixes, powers, roots）

| 観点 | 例 | LaTeX |
|---|---|---|
| prime / bar / hat | x̄ → *x bar* | `\bar{x}` |
| 下付き添字 sub | aₙ → *a sub n* | `a_n` |
| squared / cubed | y³ → *y cubed* | `y^3` |
| n乗（序数＋power） | x⁵ → *x to the fifth power* | `x^5` |
| 負の累乗 | x⁻² → *x to the minus two* | `x^{-2}` |
| 平方根・立方根 | ∛8 → *the cube root of eight* | `\sqrt[3]{8}` |
| ルート内が式（範囲を示す） | √(a+b) → *the square root of the sum of a plus b* | `\sqrt{a+b}` |

## 4. 四則演算・括弧

| 観点 | 例 | LaTeX |
|---|---|---|
| ± | a ± b → *a plus or minus b* | `a \pm b` |
| 掛け算 times / multiplied by | 3x → *three times x* | `3x` |
| 割り算 divided by / over | 6 ÷ 2 → *six divided by two* | `6 \div 2` |
| 比 | 2 : 5 → *the ratio of two to five* | `2 : 5` |
| 階乗 | n! → *n factorial* | `n!` |
| 括弧のまとまり（the sum of / the quantity） | 2(x+1) → *two times the sum of x plus one* | `2(x+1)` |
| 入れ子括弧 open / close | [a(b+c)] → *open bracket a open parenthesis b plus c close parenthesis close bracket* | `[a(b+c)]` |
| 絶対値 | \|x\| → *the absolute value of x* | `\lvert x \rvert` |

## 5. ベクトル・行列・関数

| 観点 | 例 | LaTeX |
|---|---|---|
| 内積 dot・外積 cross | **a** · **b** → *a dot b* | `\mathbf{a} \cdot \mathbf{b}` |
| 行列式 | det A → *determinant A* | `\det A` |
| 関数 f of x | g(t) → *g of t* | `g(t)` |
| 逆関数 | f⁻¹(x) → *the inverse of f of x* | `f^{-1}(x)` |
| 対数の種類（natural / common / binary） | ln 5 → *the natural log of five* | `\ln 5` |
| 極限 | lim(x→0) f(x) → *the limit of f of x as x approaches zero* | `\lim_{x \to 0} f(x)` |
| 三角・逆三角関数 | sin⁻¹ x → *inverse sine x* | `\sin^{-1} x` |

## 6. 微分・積分・総和

| 観点 | 例 | LaTeX |
|---|---|---|
| 差分 delta | Δx → *delta x* | `\Delta x` |
| 導関数 | dy/dx → *d y over d x* | `\frac{dy}{dx}` |
| 偏微分 with respect to | ∂f/∂y → *the partial derivative of f with respect to y* | `\frac{\partial f}{\partial y}` |
| 定積分 from … to … | ∫₀¹ x dx → *the integral from zero to one of x with respect to x* | `\int_0^1 x \, dx` |
| 総和 Σ | Σₖ₌₁ⁿ k → *the sum from k equals one to n of k* | `\sum_{k=1}^{n} k` |
| 総乗 Π | Πᵢ₌₁ⁿ i → *the product from i equals one to n of i* | `\prod_{i=1}^{n} i` |

## 7. 等式・不等式・関係記号

| 観点 | 例 | LaTeX |
|---|---|---|
| equals / is / is equal to | 4 + 3 = 7 → *four plus three equals seven* | `4 + 3 = 7` |
| 余り付きの割り算 | 17 ÷ 5 = 3 r2 → *seventeen divided by five is three with a remainder of two* | `17 \div 5 = 3 \text{ r} 2` |
| 比例式 is to … as | 1 : 2 = 3 : 6 → *one is to two as three is to six* | `1 : 2 = 3 : 6` |
| 展開式（the quantity） | (a+b)² → *the quantity a plus b squared* | `(a+b)^2` |
| ≠ / > / ≥ / ≫ | x ≥ 0 → *x is greater than or equal to zero* | `x \geq 0` |
| ≈ / ≡ / ∝ | y ∝ x → *y is proportional to x* | `y \propto x` |
| ⊥ / ∥ | l ∥ m → *l is parallel to m* | `l \parallel m` |
| ∴ / ∵ | ∴ x = 2 → *therefore x equals two* | `\therefore x = 2` |
| 図形（角・合同） | ∠A = ∠B → *angle A is equal to angle B* | `\angle A = \angle B` |

## 8. まとまった数式

1〜7 の観点（分数、累乗、根号、積分、総和など）を組み合わせて読む総合問題。

### 代数・解析

| 式 | LaTeX | 読み | 主な観点 |
|---|---|---|---|
| 解の公式 x = (−b ± √(b² − 4ac)) / 2a | `x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}` | *x equals negative b plus or minus the square root of b squared minus four a c, all over two a* | negative / minus、±、all over |
| 二項定理 (a+b)ⁿ = Σₖ₌₀ⁿ ₙCₖ aⁿ⁻ᵏ bᵏ | `(a+b)^n = \sum_{k=0}^{n} \binom{n}{k} a^{n-k} b^k` | *the quantity a plus b to the nth power equals the sum from k equals zero to n of n choose k times a to the n minus k times b to the k* | the quantity、Σ、choose |
| 微分の定義 f′(x) = lim_(h→0) (f(x+h) − f(x)) / h | `f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}` | *f prime of x equals the limit as h approaches zero of f of x plus h minus f of x, all over h* | prime、極限、all over |
| テイラー展開 f(x) = Σₙ₌₀^∞ f⁽ⁿ⁾(a)/n! (x−a)ⁿ | `f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!} (x-a)^n` | *f of x equals the sum from n equals zero to infinity of the nth derivative of f at a over n factorial, times the quantity x minus a to the nth power* | Σ、n階導関数、階乗 |
| オイラーの公式 e^(iθ) = cos θ + i sin θ | `e^{i\theta} = \cos\theta + i\sin\theta` | *e to the i theta equals cosine theta plus i sine theta* | 指数、三角関数、ギリシャ文字 |
| オイラーの等式 e^(iπ) + 1 = 0 | `e^{i\pi} + 1 = 0` | *e to the i pi plus one equals zero* | 入門向けの総合問題 |

### 積分変換

| 式 | LaTeX | 読み | 主な観点 |
|---|---|---|---|
| フーリエ変換 F(ω) = ∫₋∞^∞ f(t) e^(−iωt) dt | `F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} \, dt` | *F of omega equals the integral from negative infinity to infinity of f of t times e to the minus i omega t, d t* | 無限区間の積分、指数の符号 |
| ラプラス変換 F(s) = ∫₀^∞ f(t) e^(−st) dt | `F(s) = \int_0^{\infty} f(t) e^{-st} \, dt` | *F of s equals the integral from zero to infinity of f of t times e to the minus s t, d t* | 積分区間、e to the minus |
| ガウス積分 ∫₋∞^∞ e^(−x²) dx = √π | `\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}` | *the integral from negative infinity to infinity of e to the minus x squared, d x, equals the square root of pi* | 積分、根号 |

### 確率・統計

| 式 | LaTeX | 読み | 主な観点 |
|---|---|---|---|
| ベイズの定理 P(A\|B) = P(B\|A) P(A) / P(B) | `P(A \mid B) = \frac{P(B \mid A) P(A)}{P(B)}` | *P of A given B equals P of B given A times P of A, all over P of B* | given（条件付き確率） |
| 正規分布 f(x) = 1/(σ√(2π)) · e^(−(x−μ)²/(2σ²)) | `f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}` | *f of x equals one over sigma times the square root of two pi, times e to the minus the quantity x minus mu squared over two sigma squared* | ギリシャ文字、分数の入れ子 |
