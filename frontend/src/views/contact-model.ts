import Contact from '../../generated/com/vaadin/tutorial/crm/backend/service/endpoint/Contact';

export class ContactModel implements Contact {
  constructor(
    public firstName = '',
    public lastName = '',
    public email = '',
    public company = { name: '', employees: [] as Contact[], id: 0 },
    public id = 0,
    public status = ''
  ) {}
}
