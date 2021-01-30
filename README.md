# WebAssembly transpiler from WAT# to WebAssembly text format

This utility is a prototype design and implementation of the WAT# programming language. WAT# is a lightweight programming language that transpiles its output to WebAssembly text format. Its aim is that you can easily add powerful WebAssembly code to your JavaScript code, which rely on the performance of native WA.

WAT# implements only simple programming constructs that do not need any WebAssembly Runtime. The programming language avoids concepts that are not straightforward in WebAssembly.

## Main Features

You can use the standard WAT instructions within the WA#, plus a number of extensions:

- Additional simple types: `bool`, `i8` (`sbyte`), `u8` (`byte`), `i16` (`word`), `u16` (`uword`), `i32` (`int`), `u32` (`uint`), `i64` (`long`), `u64` (`ulong`), `f32` (`float`), `f64` (`double`)
- Compound types: arrays, structs, pointers
- Constant value definitions
- Include directive (`#include`) to allow using include source files
- Conditional directives (`#define`, `#undef`, `#if`, `#else`, `#elseif`, `#endif`) to define conditional compilation based on symbols
- Memory variable, memory arrays
- Simple pointer arithmetic
- Control flow statements: `if..else`, `do..while`, `while`, and `for`.
- Expression evaluation
- Inline functions

These are the steps the WAT# transpiler generates its output:

1. **Preprocessing**. The preprocessor detects the conditional and include directives. Using the conditions and included files, it merges the raw input to be used as the next phase input. This phase focuses only on preprocessing and does not check the WA# syntax at all. However, preprocessing recognizes WA# multi-line block comments and does not search for preprocessor directives within them.
2. **Syntax parsing**. The compiler parses the syntax of the raw WA# source code and collects parsing errors.
3. **Semantic analysis**. The compiler checks if the code semantics satisfy the language specification and prepare it for code emission.
4. **Code emission**. The compiler generates the WAT output.

## WAT# Program Structure

WAT# follows the semantics of WebAssembly. The result of the WAT# compilation is a WebAssembly module that contains module fields (global declarations, type declarations, memory description, tables, data elements, functions, etc.). One particular field type is a function, which may declare parameters, result types, local variables, and instrcutions.

A WAT# code has this structure:

```
watsharpCode
    : declaration*
    ;

declaration
    : constDeclaration
    | globalDeclaration
    | typeDeclaration
    | variableDeclaration
    | jumpTableDeclaration
    | functionDeclaration
    ;

functionDeclaration
    : "function" (exportSpecification)? ("inline")? (intrinsicType | "void" )? 
        parameterList locals functionBody
    ;

locals
    : local*
    ;

functionBody
    : statement*
    ;

exportSpecification
    : "export" (stringLiteral)?
    ;
```

- `declaration`: Declarations define language constructs that build up the structure of the code, but do not contain directly any executable code.
    - `constDeclaration`: You can assign a constant value to a name. During the compilation process, the transpiler replaces the occurrences of the constans's name with its value. Contansts do not generate any WebAssembly elements.
    - `globalDeclaration`: You can create variables that the transpiler handle as `global` WebAssembly declarations. Though WebAssembly allows constant `global` declarations, WAT# allows only mutables.
    - `typeDeclaration`: You can create type aliases or compound type declarations that are entirely WAT# constructs.
    - `variableDeclaration`: You can define variables that are stored in the linear memory of WebAssembly.
    - `jumpTableDeclaration`: WAT# provides programming constructs that allow indirect function calls based on the `table` concept of WebAssembly. Jump tables define the tables used for an indirect call.
    - `functionDeclaration`: The transpiler creates a WebAssembly function from each WAT# function. Thus, functions can have parameters, an optional result type, and local declarations. Functions are the only constructs that contain statements.

## WAT# Type System

WAT# provides additional types to the four intrinsic WebAssembly type (`i32`, `i64`, `f32`, `f64`) so that every extra type's operations can be implemented with the WA's types &mdash; without any runtime code.

WAT# deliberately does not support strings and characters.

### Simple WAT# Types

WAT# supports these types:

1. Types that leverage the `i32` WA type:
    - `bool`: Boolean value. Any non-zero `i32` value is considered as `true`. Zero is `false`.
    - `sbyte` or `i8`: 8-bit signed integer (-128 .. 127)
    - `byte` or `u8`: 8-bit unsigned integer (0 .. 255)
    - `short` or `i16`: 16-bit signed integer (-32768 .. 32767)
    - `ushort` or `u16`: 16-bit unsigned integer (0 .. 65535)
    - `int` or `i32`: 32-bit signed integer (-2 147 483 648 .. -2 147 483 647)
    - `uint` or `u32`: 32-bit unsigned integer (0 .. 4 294 967 295)

2. Types that leverage the `i64` WA type:
    - `long` or `i64`: 32-bit signed integer (-9 223 372 036 854 775 808 .. 9 223 372 036 854 775 807)
    - `ulong` or `u64`: 64-bit unsigned integer (0 .. 18 446 744 073 709 551 615)

3. Types that leverage the floating-point types in WA:
    - `float` or `f32`: 32-bit floating-point type
    - `double` or  `f64`: 64-bit floating point type 

### Arrays

WAT# allows declaring arrays with one or more dimension. Array items can be an instance of any types.

### Structures

WAT# structures are records with fields. Each field has a name and a type. Record fields can be accessed individually.

### Pointers

You can have pointers to instances of a specific type. A pointer is a 32-bit value that points to a WebAssembly linear memory location (using the `i32` WebAssembly type). When you execute operations with a pointer, those consider the underlying type. For example, when you increment the value of a pointer, that leverage the byte-length of the underlying instance.

### Compound Types

You can build compound types from single types by combining them. For example, you may have an array of pointers of structures. Structure fields may be arrays and pointer, or even other structures, and so on.

### Type Declaration Syntax

```
typeDeclaration
    : "type" identifier "=" typeSpecification ";"
    ;

typeSpecification
    : simpleType
    | pointerType
    | arrayType
    | structType
    | "(" typeSpecification ")"
    ;

simpleType
    : "i8" | "sbyte" | "u8" | "byte"
    | "i16" | "short" | "u16" | "ushort"
    | "i32" | "int" | "u32" | "uint"
    | "i64" | "long" | "u64" | "ulong"
    | "f32" | "float"
    | "f64" | "double"

pointerType
    : "*" typeSpecification
    ;

arrayType
    : typeSpecification "[" expr "]"
    ;

structType
    : "struct" "{" structField ("," structField)* "}"
    ;

structField
    : identifier ":" typeSpecification
    ;
```
## Syntax Basics

## Comments and whitespaces

The space, tabulator, carriage return (0x0d) and new line (0x0a) characters are all whitespaces. 

WA# supports two types of comments:

Block comments can be multi-line but cannot nested into each other.

```
blockComment :=
    "/*" any* "*/"
    ;
```

End-of-line comments can start at any point of the current line and comple with the end of the line

```
eolComment :=
    ( "//" | ";;" ) (^newLine)*
    ;
```

## Preprocessor directives

When you start the compilation of a WA# code, you can pass predefined symbols to the compiler. Those symbols can be used in conditional preprocessor directives. WA# supports these preprocessor directives:

- `#define`: Defines a symbol
- `#undef`: Removes a symbol (is if it were not defined)
- `#if`: Checks if condition is satisfied
- `#else`: A branch for an unsatisfied condition
- `#elseif`: A branch for an alternative test
- `#endif`: End of an `#if` condition
- `#include`: includes the contents of another file in the compilation

A directive must start at the first non-whitespace character of a source code line. Directives cannot contain comments, they must be completed on the same line they start.

### `#define` and `#undef`

Use these directives to define new symbols or remove exsiting symbols.

Syntax:

```
ppDefine :=
    "#define" ppIdentifier
    ;

ppUndef :=
    "#undef" ppIdentifier
    ;

ppIdentifier :=
    ppIdStart idCont*
    ;

ppIdStart :=
    | "a" .. "z"
    | "A" .. "Z"
    | "_"
    ;
```

### `#if`, `#else`, `#elseif`, and `#endif`

These preprocessor directives allow you to define conditional compilation:

```
#if Symbol1
  // Declare code when Symbol1 is declared
#elseif Symbol2 && !Symbol3
  // Declare here code when Symbol2 is declared, but not Symbol3
#else
  // All other cases
#endif
```

Syntax:
```
ppIf :=
    "#if" ppExpr
    waSharpCode
    (
        "#elseif" ppExpr
        waSharpCode
    )*
    (
        "#else" ppExpr
        waSharpCode
    )?
    "#endif"
    ;

ppExpr :=
    | "(" ppExpr ")"
    | ppOrExpr
    ;

ppOrExpr :=
    ppXorExpr ( "|" ppXorExpr )?
    ;

ppXorExpr :=
    ppAndExpr ( "^" ppAndExpr )?
    ;

ppAndExpr :=
    ppPrimaryuExpr ( "&" ppPrimaryExpr )?
    ;

ppPrimaryExpr :=
    | ppIdentifier
    | "!" ppIdentifier
    ;
```

### `#include`

This directive includes the contents of another file in the compilation.

Syntax:

```
#include :=
    '"' string '"'
    ;
```

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
structDeclaration :=
    "struct" typeIdentifier "{" fieldDeclaration (";" fieldDeclaration)* ";"? "}"
    ;

fieldDeclaration :=
    type identifier ("[" expr "]")?
    ;
```

Structures can be stored only in memory variables.

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
    type identifier ("[" expr "]")? ( "=" expr)?
    ;
```

> *Note*: If _dimension_ is used, the variable is a memory variable. The _dimension_ value must be an expression that can be evaluated compile time.

## Data declaration

Data declarations can be used to init memory the variables' data-

Syntax:

```
dataDeclaration :=
    "data" identifier "=" (integralType)? "[" expr? ("," expr)? "]"
    ;
```

## Import declaration

Syntax:

```
importDeclaration :=
    "import" stringLiteral stringLiteral "(" integralType? ("," integralType)* ")"
    ;
```


## Statements

Syntax:

```
statement :=
    | blockStatement
    | variableDeclaration
    | functionDeclaration
    | jumpTableDeclaration
    | assignment
    | controlFlowStatement
    ;

blockStatement :=
    "{" statement? (";" statement)* }
    ;
```

## Expressions

Syntax:

```
expr
    : conditionalExpr
    ;

conditionalExpr
    : orExpr ( "?" expr ":" expr )?
    ;

orExpr
    : xorExpr ( "|" xorExpr )?
    ;

xorExpr
    : andExpr ( "^" andExpr )?
    ;

andExpr
    : equExpr ( "&" equExpr )?
    ;

equExpr
    :  relExpr ( ( "==" | "!=" ) relExpr )?
    ;

relExpr
    : shiftExpr ( ( "<" | "<=" | ">" | ">=" ) shiftExpr )?
    ;

shiftExpr
    : addExpr ( ( "<<" | ">>" | ">>>" ) addExpr )?
    ;

addExpr
    : multExpr ( ( "+" | "-" ) multExpr )?
    ;

multExpr
    : memberOrIndexExpr ( ( "*" | "/" | "%") memberOrIndexExpr )?
    ;

memberOrIndexExpression
    : memberExpression
    | indexExpression
    ;
 
memberExpression
    : primaryExpression "." expr
    ;
 
indexExpression
    : primaryExpression "[" expr "]"
    ;

primaryExpr
    : "sizeof" "(" typeSpec ")"
    | funcInvocation
    | literal
    | identifier
    | unaryExpr
    | "(" expr ")"
    ;

functionInvocation :=
    identifier "(" expr? ("," expr)* ")"
    ;

literal
    : binaryLiteral
    | decimalLiteral
    | hexadecimalLiteral
    | realLiteral
    ;

unaryExpr
    : ( | "+" | "-" | "~" | "!" | "&" | "*" ) unaryExpr
    ;

binaryLiteral
    : "0b" binaryDigit ("_"? binaryDigit)*
    ;

decimalLiteral
    : decimalDigit ("_" ? decimalDigit)*
    ;

hexaDecimalLiteral
    : "0x" hexaDigit ("_"? hexaDigit)*
    ;

realLiteral
    : decimalDigit ("_"? decimalDigit)* "." decimalDigit+ (("e" | "E") ("+" | "-")? decimalDigit+)?
    | decimalDigit+ (("e" | "E") ("+" | "-")? decimalDigit+)
    ;

binaryDigit
    : "0" | "1"
    ;

decimalDigit
    : "0" .. "9"
    ;

hexaDigit
    : "0" .. "9"
    | "a" .. "f"
    | "A" .. "F"
    ;
```

## Assignments

Syntax:

```
assignment :=
    leftValue ( "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "^|" | "&=" | "|=" | "~=" | "!=" ) expr
    ;

leftValue :=
    addressable ("." addressable )*
    ;

addressable := 
    identifier ("[" expr "]")?
    ;
```

## Function declarations

Syntax:

```
functionDeclaration :=
    exportModifier? inlineModifier? identifier parameterList blockStatement
    ;

exportModifier :=
    "export" ( stringLiteral )?
    ;

inlineModifier :=
    "inline"
    ;

parameterList :=
    "(" parameterDecl? ("," parameterDecl)* ")"
    ;

parameterDecl :=
    type identifier
    ;
```

## Jump tables

Syntax:

```
jumpTableDeclaration :=
    "table" tableIdentifier "{" identifier? ("," identifier)* "}"
    ;

tableIdentifier :=
    "@" idCont+
    ;
```

## Control flow statements

Syntax:

```
controlFlowStatement :=
    | ifStatement
    | whileStatement
    | doWhileStatement
    | breakStatement
    | continueStatement
    | returnStatement
    ;

ifStatement :=
    "if" "(" condition ")" statements ("else" statements)?
    ;

whileStatement :=
    "while" "(" expr ")" statements
    ;

doWhileStatement :=
    "do" statements "while" "(" expr ")"
    ;

breakStatement := 
    "break"
    ;

continueStatement :=
    "continue"
    ;

returnStatement :=
    "return" expr?
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

structDeclaration :=
    "struct" structIdentifier "{" fieldDeclaration ("," fieldDeclaration)* "}"
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
    | structIdentifier
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
    | "_"
    | "."
    ;

structIdentifier := 
    "#" idCont+
    ;
```
