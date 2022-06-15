import {VMContext, u128, PersistentVector, Context} from "near-sdk-as"
import {ONE_NEAR, MIN_ACCOUNT_BALANCE} from "../../../utils"
import * as App from "../index"
import * as Models from "../models"

const VALID_THOUGHT = "Here's a thought",
    VALID_DEPOSIT = u128.from(1),
    THINKER = 'thinker',
    JOURNAL = new PersistentVector<Models.Thought>("t")

    let contract: App.Contract

    describe("Contract", () => {
        beforeEach(() => {
            const pb = new Models.PiggyBank(),
            initialDeposit = MIN_ACCOUNT_BALANCE

            VMContext.setAttached_deposit(initialDeposit)
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
                            }).toThrow()
                        })
                    })
                })
                describe("Invalid deposit", () => {
                    describe("deposit is too big", () => {
                        it("should throw", () => {
                            expect(() => {
                                // Negative number will wrap to max unsigned
                                VMContext.setAttached_deposit(u128.from(-1))
                                contract.shareThought(VALID_THOUGHT)
                            }).toThrow()
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
            it("should return the thoughts in reverse chronological order", () => {
                const secondThought = "On second thought..."
                contract.shareThought(secondThought)

                const thoughts = contract.readThoughts()

                expect(thoughts[0].text).toBe(secondThought)
            })
            describe("Context differences", () => {
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
                        expect(thoughts[0].text).toBe(VALID_THOUGHT)
                    })
                })
                describe("Caller is the thinker", () => {
                    it("should return the thoughts", () => {
                        const thoughts = contract.readThoughts()
                        expect(thoughts[0].text).toBe(VALID_THOUGHT)
                    })
                })
            })
            describe("Call arguments", () => {
                beforeEach(() => {
                    //Publish multiple thoughts
                    for(let i=1; i<=20; i++) {
                        // Pay for storage
                        VMContext.setAttached_deposit(u128.from(3))
                        contract.shareThought("Thought"+i.toString())
                    }
                })
                describe("No args", () => {
                    it("should return 10 thoughts", () => {
                        const thoughts = contract.readThoughts()
                        expect(thoughts.length).toBe(10)
                    })
                })
                describe("Optional args", () => {
                    describe("Called with 'count'", () => {
                        it("should return the desired number of thoughts", () => {
                            const desiredCount = 5,
                                thoughts = contract.readThoughts(desiredCount)

                            expect(thoughts.length).toBe(desiredCount)
                        })
                    })
                    describe("Called with 'skip'", () => {
                        it("should skip the desired number of thoughts, returning the next ones", () => {
                            const desiredSkip = 10,
                                thoughts = contract.readThoughts(10, desiredSkip)

                            expect(thoughts[0].text).toBe("Thought10")
                        })
                    })
                })
            })
        })
        describe("#givePenny", () => {
            describe("Invalid deposit", () =>{
                describe("Deposit too big", () => {
                    beforeEach(() => {
                        // Negative values wrap to large unsigned values
                        VMContext.setAttached_deposit(u128.from(-1))
                    })
                    it("should throw", () => {
                        expect(() => {
                            contract.givePenny()
                        }).toThrow()
                    })
                })
            })
            describe("Valid deposit", () => {
                beforeEach(() => {
                    VMContext.setAttached_deposit(VALID_DEPOSIT)
                })
                it("should add the deposit to the piggybank", () => {
                    const initialBalance = contract.piggyBank.amount

                    contract.givePenny()

                    expect(contract.piggyBank.amount).toBe(initialBalance + VALID_DEPOSIT)
                })
            })
        })
        describe("#breakBank", () => {
            describe("Valid caller", () => {
                beforeEach(() => {
                    VMContext.setSigner_account_id(THINKER)
                })
                describe("Balance too low", () => {
                    it("should throw", () => {
                        expect(() => {
                            contract.breakBank()
                        }).toThrow()
                    })
                })
                describe("Valid balance", () => {
                    beforeEach(() => {
                        VMContext.setAttached_deposit(VALID_DEPOSIT)
                        contract.givePenny()
                    })

                    it("should set the piggybank balance to the minimum", () => {
                        contract.breakBank()

                        expect(contract.piggyBank.amount).toBe(u128.Zero)
                    })
                })
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
    })
