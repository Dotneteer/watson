/**
 * Discriminated unions of type specifications
 */
export type TypeSpec = IntrinsicType | PointerType | ArrayType | StructType;

/**
 * Type identifiers for intrinsic types
 */
export type Instrinsics =
  | "i8"
  | "u8"
  | "i16"
  | "u16"
  | "i32"
  | "u32"
  | "i64"
  | "u64"
  | "f32"
  | "u32";

/**
 * Base type of all type specifications
 */
interface TypeSpecBase {
  type: TypeSpec["type"];
}

/**
 * Instrinsic type specification
 */
export interface IntrinsicType extends TypeSpecBase {
  type: "Intrinsic";
  underlying: Instrinsics;
}

/**
 * Pointer type specification
 */
export interface PointerType extends TypeSpecBase {
  type: "Pointer";
  spec: TypeSpec;
}

/**
 * Array type specification
 */
export interface ArrayType extends TypeSpecBase {
  type: "Array";
  spec: TypeSpec;
  size: number;
}

/**
 * Struct type specification
 */
export interface StructType extends TypeSpecBase {
  type: "Struct";
  fields: StructField[];
}

/**
 * Describes a structure field
 */
export interface StructField {
  id: string;
  spec: TypeSpec;
}
