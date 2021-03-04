(module
  (memory (export "memory") 1)
  (table $tables$ 0 anyfunc)
  
  ;; Exported functions
  (export "myFunc" (func $myFunc))
  (export "dummy" (func $dummy))
  
  ;; Variable mappings
  ;; 0x00000000 (         0) [         1]: a
  
  (func $myFunc
  )
  
  (func $dummy
    (local $loc$b i32)
    i32.const 0
    i32.load8_u
    i32.const 2
    i32.mul
    set_local $loc$b
  )
)