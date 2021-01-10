# WebAssembly transpiler from WA# to WebAssembly text format

This utility is a prototype design and implementation of the WA# programming language. WA# is a lightweight programming language that transpiles its output to WebAssembly text format. Its aim is that you can easily add powerful WebAssembly code to your JavaScript code, which rely on the performance of native WA.

## Main Features

You can use the standard WAT instructions within the WA#, plus a number of extensions:

- Additional types: `bool`, `i8` (`sbyte`), `u8` (`byte`), `i16` (`word`), `u16` (`uword`), `i32` (`int`), `u32` (`uint`), `i64` (`long`), `u64` (`ulong`), `f32` (`float`), `f64` (`double`)
- Constant value definitions
- Include directive (`#include`) to allow using include source files
- Conditional directives (`#ifdef`, `#ifndef`, `#else`, `#elseif`, `#endif`) to define conditional compilation based on symbols
- Memory variable, memory arrays
- Simple pointer arithmetic
- Control flow statements: `if..else`, `do..while`, `while`, `for`
- Expression evaluation
- Inline functions

## Types

WA# has only value types. Nonethless, integral value types can be used as offsets, so used together with memory variables, you can use indirect memory access, and emulate reference types.

### The `bool` type

Represent a Boolean value that can be used as a condition in control flow statements or conditional expressions. Every other type can be converted into a `bool`:
- Zero integral, `float`, or `double` values represent `false`.
- Any other integral, `float`, or `double` values represent `true`.

### Integral types

Integral types can be signed or unsigned; they have multiple type names that can be used according to your preference:

- `i8` (`sbyte`): 8-bit signed integer
- `u8` (`byte`): 8-bit unsigned integer
- `i16` (`word`, `short`): 16-bit signed integer
- `u16` (`uword`, `ushort`): 16-bit unsigned integer
- `i32` (`int`): 32-bit signed integer
- `u32` (`uint`): 32-bit unsigned integer
- `i64` (`long`): 64-bit signed integer
- `u64` (`ulong`): 64-bit unsigned integer

Expression evaluation:
- 8-bit, 16-bit, and 32-bit values use 32-bit arithmetic.
- 64-bit values use 64-bit arithmetic. 
- Operations that support signed and unsigned values, the type of operation is determined according to the current operands to preserve sign values.

Explicit conversion: Values can be explicitly converted to other values.
Implicit conversion: Values are automatically converted to 32-bit or 64-bit values while evaluating expressions. When storing values back to variables or memory, types are automatically converted back to their storage size.

### Floating point types

- `f32` (`float`, `real`): 32-bit floating-point value
- `f64` (`doube`): 64-bit floating-point value

### Structure types

Structures are compound types made from value types.

Syntax:

```
recordDeclaration :=
    "record" typeIdentifier "{" fieldDeclaration ("," fieldDeclaration)* "}"
    ;

fieldDeclaration :=
    type identifier ";"
    ;
```

## Constant values

Constants are name and value pairs. Their value is calculated during compilation time, and are their names are replaced with their value.

Syntax:

```
constDeclaration := 
    "const" type identifier "=" expr
    ;
```

## Variables

Variable can be one of these types:

- Global variable. These are stored as global WebAssembly variables
- Local variables of WebAssembly functions
- Memory variables. They are stored in the linear memory of WebAssembly

Syntax:

```
variableDeclaration :=
    type identifier dimension? ( "=" expr)?
    ;

dimension :=
    "[" expr "]"
    ;
```

> *Note*: If _dimension_ is used, the variable is a memory variable. The _dimension_ value must be an expression that can be evaluated compile time.

## Expressions

Syntax:

```
expr :=
    | "(" expr ")"
    | conditionalExpr
    ;

conditionalExpr :=
    orExpr ( "?" expr ":" expr )?
    ;

orExpr :=
    xorExpr ( "|" xorExpr )?
    ;

xorExpr :=
    andExpr ( "^" andExpr )?
    ;

andExpr :=
    equExpr ( "&" equExpr )?
    ;

equExpr :=
    relExpr ( ( "==" | "===" | "!=" | "!==" ) relExpr )?
    ;

relExpr :=
    shiftExpr ( ( "<" | "<=" | ">" | ">=" ) shiftExpr )?
    ;

shiftExpr :=
    addExpr ( ( "<<" | ">>" | ">>>" ) addExpr )?
    ;

addExpr :=
    multExpr ( ( "+" | "-" ) multExpr )?
    ;

multExpr :=
    primaryExpr ( ( "*" | "/" | "%") primaryExpr )?
    ;

primaryExpr :=
    | funcInvocation
    | literal
    | identifier
    | unaryExpr
    | typeCast
    ;

functionInvocation :=
    identifier "(" expr? ("," expr)* ")"
    ;

literal :=
    | binaryLiteral
    | decimalLiteral
    | hexadecimalLiteral
    | realLiteral
    ;

unaryExpr :=
    ( | "+" | "-" | "~" | "!" ) expr
    ;

typeCast :=
    valueType "(" expr ")"
    ;
```

## Reference

### Reserved keywords

`bool`, `byte`, `const`, `double`, `f32`, `f64`, `float`, `i16`, `i32`, `i64`, `i8`, `int`, `long`, `real`, `sbyte`, `short`, `u8`, `u16`, `u32`, `u64`, `uint`, `ulong`, `ushort`, `uword`, `word`

### Syntax description

```
constDeclaration := 
    "const" valueType identifier "=" expr
    ;

recordDeclaration :=
    "record" typeIdentifier "{" fieldDeclaration ("," fieldDeclaration)* "}"
    ;

fieldDeclaration :=
    type identifier ";"
    ;

variableDeclaration :=
    type identifier dimension? ( "=" expr)?
    ;

dimension :=
    "[" expr "]"
    ;

type :=
    | valueType
    | typeIdentifier
    ;

valueType :=
    | boolType
    | integralType
    | floatingPointType
    ;

boolType := "bool" ;

integralType :=
    | i8Type
    | u8Type
    | i16Type
    | u16Type
    | i32Type
    | u32Type
    | i64Type
    | u64Type
    ;

floatingPointType :=
    | f32Type
    | f64Type
    ;

i8Type :=
    | "i8" 
    | "sbyte"
    ;

u8Type :=
    | "u8" 
    | "byte"
    ;

i16Type :=
    | "i16" 
    | "word"
    | "short"
    ;

u16Type :=
    | "u16" 
    | "uword"
    | "ushort"
    ;

i32Type :=
    | "i32" 
    | "int"
    ;

u32Type :=
    | "u32" 
    | "uint"
    ;

i64Type :=
    | "i64" 
    | "long"
    ;

u64Type :=
    | "u64" 
    | "ulong"
    ;
f32Type :=
    | "f32" 
    | "float"
    | "real"
    ;

f64Type :=
    | "f64" 
    | "double"
    ;

identifier :=
    "$" idCont+

idCont :=
    | "a" .. "z"
    | "A" .. "Z"
    | "0" .. "9"
    | "@"
    | "_"
    ;

typeIdentifier := 
    typeIdStart (idCont)*
    ;

typeIdStart :=
    | "a" .. "z"
    | "A" .. "Z"
    | "_"
    ;
```
