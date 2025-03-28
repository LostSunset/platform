import { type AnyAttribute, type Association, type Ref } from '@hcengineering/core'
import { ProcessFunction } from '.'

export interface Context {
  attributes: AnyAttribute[]
  nested: Record<string, NestedContext>
  relations: Record<string, RelatedContext>
}

export interface NestedContext {
  attribute: AnyAttribute
  attributes: AnyAttribute[]
}

export interface RelatedContext {
  name: string
  association: Ref<Association>
  direction: 'A' | 'B'
  attributes: AnyAttribute[]
}

interface BaseSelectedContext {
  type: 'attribute' | 'relation' | 'nested'
  // attribute key
  key: string

  // reduce array function for source obj
  sourceFunction?: Ref<ProcessFunction>

  // process one by one
  functions?: Array<Ref<ProcessFunction>>

  fallbackValue?: any
}

export interface SelectedAttribute extends BaseSelectedContext {
  type: 'attribute'
}

export interface SelectedRelation extends BaseSelectedContext {
  type: 'relation'
  name: string
  association: Ref<Association>
  direction: 'A' | 'B'
}

export interface SelectedNested extends BaseSelectedContext {
  type: 'nested'
  path: string // ref attribute key
}

export type SelectedContext = SelectedAttribute | SelectedRelation | SelectedNested
