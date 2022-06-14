import {VMContext, u128} from "near-sdk-as"
import * as Models from "../models"

let bank: Models.PiggyBank,
  thought: Models.Thought,
  thinker: string = 'thinker'

describe("Models", () => {
  describe("Thought", () => {
    describe("#constructor()", () => {
      describe("Invalid params", () => {
        describe("Text empty", () => {
          it("should throw an error", () => {
            const emptyText = ""

            expect(() => {new Models.Thought(emptyText)}).toThrow()
          })
        })
        describe("Text longer than maxLength", () => {
          it("should throw an error", () => {
            expect(() => {
              const tooLongLength: i32 = Models.Thought.maxLength()+1,
                fillerChar: string = "a",
                inputText: string = "".padStart(tooLongLength, fillerChar)

              ;new Models.Thought(inputText)
            }).toThrow()
          })
        })
      })
      it("should set the text to the first parameter", () => {
        const inputText = "I think, therefore..."
        thought = new Models.Thought(inputText)
        expect(thought.text).toBe(inputText)
      })
      it("should set the thinker to the caller", () => {
        const inputText = "something"
        VMContext.setSigner_account_id(thinker)
        thought = new Models.Thought(inputText)

        expect(thought.thinker).toBe(thinker)
      })
    })
  })

  describe("PiggyBank", () => {
    beforeEach(() => {
      bank = new Models.PiggyBank()
    })
    describe("#constructor()", () => {
      it("should initialize the amount to 0", () => {
        expect(bank.amount).toBe(u128.Zero)
      })  
    })
    describe("#deposit()", () => {
      it("should increase the amount by the deposit amount", () => {
        
        bank.deposit(u128.from(5))

        expect(bank.amount).toBe(u128.from(5))
      })
    })
    describe("#refresh()", () => {
      beforeEach(() => {
        bank.amount = u128.from(88)
      })
      it("should set the amount to 0", () => {
        bank.refresh()
        expect(bank.amount).toBe(u128.Zero)
      })
    })
  })
})
