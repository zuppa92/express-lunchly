const db = require('../db');
const Reservation = require('./reservation');

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, first_name AS "firstName",
              last_name AS "lastName", phone, notes
       FROM customers
       ORDER BY last_name, first_name`
    );

    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const result = await db.query(
      `SELECT id, first_name AS "firstName",
              last_name AS "lastName", phone, notes
       FROM customers WHERE id = $1`,
      [id]
    );

    const customer = result.rows[0];

    if (!customer) {
      throw new Error(`No such customer: ${id}`);
    }

    return new Customer(customer);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers
         SET first_name=$1, last_name=$2, phone=$3, notes=$4
         WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return Reservation.getReservationsForCustomer(this.id);
  }
}

module.exports = Customer;
