const db = require("../db");
const moment = require("moment");

class Reservation {
  constructor({ id, customerId, startAt, numGuests, notes }) {
    this.id = id;
    this.customerId = customerId;
    this.startAt = startAt;
    this.numGuests = numGuests;
    this.notes = notes;
  }

  /** formatter for startAt */
  getFormattedStartAt() {
    return moment(this.startAt).format("MMMM Do YYYY, h:mm a");
  }

  /** given a reservation id, return reservation details. */
  static async get(id) {
    const result = await db.query(
      `SELECT id, 
              customer_id AS "customerId", 
              start_at AS "startAt", 
              num_guests AS "numGuests", 
              notes
       FROM reservations 
       WHERE id = $1`,
      [id]
    );

    let reservation = result.rows[0];

    if (!reservation) {
      const err = new Error(`No reservation found: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Reservation(reservation);
  }

  /** save this reservation. */
  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO reservations (customer_id, start_at, num_guests, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [this.customerId, this.startAt, this.numGuests, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE reservations
         SET customer_id=$1, start_at=$2, num_guests=$3, notes=$4
         WHERE id=$5`,
        [this.customerId, this.startAt, this.numGuests, this.notes, this.id]
      );
    }
  }

  /** given a customer id, return reservations for that customer. */
  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
      `SELECT id, 
              customer_id AS "customerId", 
              start_at AS "startAt", 
              num_guests AS "numGuests", 
              notes
       FROM reservations 
       WHERE customer_id = $1`,
      [customerId]
    );

    return results.rows.map(r => new Reservation(r));
  }
}

module.exports = Reservation;
