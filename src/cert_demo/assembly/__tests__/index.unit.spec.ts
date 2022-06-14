import {VMContext, u128, PersistentVector, Context} from "near-sdk-as"
import {ONE_NEAR} from "../../../utils"
import * as App from "../index"
import * as Models from "../models"

const VALID_THOUGHT = "Here's a thought",
    THINKER = 'thinker',
    JOURNAL = new PersistentVector<Models.Thought>("t")

    let contract: App.Contract

    describe("Contract", () => {
        beforeEach(() => {
            const pb = new Models.PiggyBank()
            pb.deposit(u128.mul(ONE_NEAR, u128.from(5)))
            contract = new App.Contract(THINKER, JOURNAL, pb)
        })
        describe("#shareThought()", () => {
            describe("Invalid call", () => {
                describe("Caller is not the thinker", () => {
                    beforeEach(() => {
                        // Set caller to notThinker
                        VMContext.setSigner_account_id('notTheThinker')
                    })
                    afterEach(() => {
                        // Undo the changes to the context
                        VMContext.setSigner_account_id(THINKER) 
                    })
                    it("should throw", () => {
                        expect(() => {
                            contract.shareThought(VALID_THOUGHT)    
                        }).toThrow()
                    })
                })
                describe("Invalid args", () => {
                    describe("Text is empty", () => {
                        it("should throw", () => {
                            expect(() => {
                                const emptyThought = ""
                                VMContext.setSigner_account_id(THINKER)
                                contract.shareThought(emptyThought)
                            })
                        })
                    })
                })
            })
            describe("Valid call", () => {
                // Make valid call
                beforeEach(() => {
                    VMContext.setSigner_account_id(THINKER)
                    contract.shareThought(VALID_THOUGHT)
                })
                it("should add the thought to the journal", () => {
                    const firstThought = JOURNAL.first
                    expect(firstThought.text).toBe(VALID_THOUGHT)
                })
                it("should add each thought to the end of the journal", () => {
                    const secondThought = "On second thought..."
                    contract.shareThought(secondThought)
                    expect(JOURNAL.last.text).toBe(secondThought)
                })
            })
        })
        describe("#readThoughts()", () => {
            beforeEach(() => {  
                VMContext.setSigner_account_id(THINKER)
                // Not totally necessary, but empty collections all look alike.
                // Unique values are less prone to false positives.
                contract.shareThought(VALID_THOUGHT)
            })
            describe("Caller is not the thinker", () =>{
                beforeEach(() => {
                    // Set the context
                    VMContext.setSigner_account_id('notTheThinker')
                })
                afterEach(() => {
                    // Clean up the context
                    VMContext.setSigner_account_id(THINKER)
                })
                it("should return the thoughts", () => {
                    const thoughts = contract.readThoughts()
                    expect(thoughts.length).toBe(1)
                })
            })
            describe("Caller is the thinker", () => {
                it("should return the thoughts", () => {
                    const thoughts = contract.readThoughts()
                    expect(thoughts[0].text).toBe(VALID_THOUGHT)
                })
            })
        })
        describe("#breakBank", () => {
            // This test cannot be performed with as-pect, sadly.
            xit("should add the deposited value to the thinker's account balance", () => {
                VMContext.setSigner_account_id(THINKER)
                VMContext.setAccount_balance(u128.mul(ONE_NEAR, u128.from(22)))
            
                const startBal: u128 = Context.accountBalance

                contract.breakBank()
                expect(Context.accountBalance).toBe(startBal)
            })
        })
    })
