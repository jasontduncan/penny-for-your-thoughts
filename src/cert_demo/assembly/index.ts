import {logging, Context, u128, PersistentVector, ContractPromiseBatch} from "near-sdk-core"
import { AccountId, ONE_NEAR, XCC_GAS, MIN_ACCOUNT_BALANCE, assert_self, assert_single_promise_success} from "../../utils"
import {Thought, PiggyBank} from "./models"

const MAX_PENNY_VALUE: u128 = u128.mul(ONE_NEAR, u128.from(15))

@nearBindgen
export class Contract {
    private thinker: AccountId
    private journal: PersistentVector<Thought>
    private piggyBank: PiggyBank// = new PiggyBank()

    constructor(thinker: AccountId, journal: PersistentVector<Thought> = new PersistentVector<Thought>("t"), piggyBank: PiggyBank = new PiggyBank()) {
        this.thinker = thinker
        this.journal = journal
        this.piggyBank = piggyBank
    }

    @mutateState()
    shareThought(thought: string): bool {
        // Only the thinker may share a thought
        this.assertThinker()

        const deposit = Context.attachedDeposit
        this.assertPennyLimit(deposit)

        assert(thought.length > 0, "Thought can't be blank.")
        assert(thought.length <= Thought.maxLength(), "Thought can't be longer than "+ Thought.maxLength().toString() +"characters.")

        //Put deposit in the piggyBank
        this.piggyBank.deposit(deposit)
        //Add the thought to the journal
        this.journal.push(new Thought(thought))

        return true
    }

    @mutateState
    breakBank(): void {
        this.assertThinker()

        // Have to leave something in the bank for storage staking
        assert(this.piggyBank.amount > u128.Zero, "There's nothing in the bank.")
        
        const theContract = Context.contractName,
            theThinker = ContractPromiseBatch.create(this.thinker)
        
        // Do the thing
        theThinker.transfer(this.piggyBank.amount)
        .then(theContract).function_call("onTransferComplete", "{}", u128.Zero, XCC_GAS)

        this.piggyBank.refresh()
    }

    @mutateState()
    onTransferComplete(): void {
        assert_self()
        assert_single_promise_success()

        logging.log("Transfer completed")
        //this.piggyBank.refresh()
    }

    /*
     * I wouldn't normally use signed ints for args that have no meaningful negative values, but PersistentVector.length returns i32.
     * When in Rome...
     */
    readThoughts(count: i32=10, skip: i32=0): Thought[] {
        const thoughts: Thought[] = [],
            fetchLimit: i32 = this.journal.length < count ? this.journal.length : count

        for(let i=(this.journal.length-1)-skip; i>=(this.journal.length-skip)-fetchLimit; i--) {
            thoughts.push(this.journal[i])
        }

        return thoughts
    }

    @mutateState
    givePenny(): void {
        const pennies = Context.attachedDeposit

        this.assertPennyLimit(pennies)

        this.piggyBank.deposit(pennies)        
    }

    //Internal
    private assertPennyLimit(amount: u128): void {
        const total = u128.add(amount, this.piggyBank.amount)
        assert(u128.le(amount, MAX_PENNY_VALUE), "Too many pennies for this piggy bank. Try a lower amount")
        assert(u128.le(total, MAX_PENNY_VALUE), "No more room in the piggy bank.")
        assert(u128.ge(amount, u128.Zero), "Negative penny amounts not allowed.")
    }

    private assertThinker(): void {
        const caller = Context.sender
        assert(this.thinker == caller, "You don't appear to be the owner of this journal. Owner: "+ this.thinker +", You: "+ caller)
    }
}

